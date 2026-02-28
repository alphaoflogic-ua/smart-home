import { AuthProvider } from '@/features/auth/model/AuthContext';
import { Router } from '@/router/Router';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ThemeProvider>
  );
};
