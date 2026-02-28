import { createContext, type ReactNode, useState, useEffect, useCallback } from 'react';
import { authService, type User, type LoginCredentials } from '../api/auth.service';

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  hasAdmin: boolean | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  checkRegistrationStatus: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkRegistrationStatus = useCallback(async () => {
    try {
      const data = await authService.checkRegistrationStatus();
      setHasAdmin(!data.isRegistrationOpen);
    } catch (error) {
      console.error('Failed to check registration status', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        await checkRegistrationStatus();
        setUser(null);
        return;
      }
      const data = await authService.refresh(refreshToken);
      (window as any)._accessToken = data.accessToken;
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      setUser(data.user);
    } catch (error) {
      setUser(null);
      (window as any)._accessToken = null;
      localStorage.removeItem('refreshToken');
      await checkRegistrationStatus();
    } finally {
      setIsLoading(false);
    }
  }, [checkRegistrationStatus]);

  const login = async (credentials: LoginCredentials) => {
    const data = await authService.login(credentials);
    (window as any)._accessToken = data.accessToken;
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    setUser(data.user);
  };

  const register = async (credentials: LoginCredentials) => {
    await authService.register(credentials);
    // After registration, we might want to auto-login or redirect to login
    // Given the task, the user created becomes OWNER, so we can login them directly if API supports it
    // But our API /register currently only returns user without tokens.
    // So let's just update hasAdmin status.
    await checkRegistrationStatus();
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authService.logout(refreshToken);
    } finally {
      setUser(null);
      (window as any)._accessToken = null;
      localStorage.removeItem('refreshToken');
      await checkRegistrationStatus();
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, isLoading, hasAdmin, login, register, logout, refresh, checkRegistrationStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
