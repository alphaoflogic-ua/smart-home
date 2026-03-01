import { apiClient } from '@/shared/api/client';

export type User = {
  id: string;
  email: string;
  role: string;
};

export type LoginCredentials = {
  email: string;
  password?: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken?: string;
};

export type RegistrationStatusResponse = {
  isRegistrationOpen: boolean;
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: LoginCredentials): Promise<void> => {
    await apiClient.post('/auth/register', credentials);
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  logout: async (refreshToken: string | null): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  checkRegistrationStatus: async (): Promise<RegistrationStatusResponse> => {
    const { data } = await apiClient.get<RegistrationStatusResponse>('/auth/registration-status');
    return data;
  },
};
