import { AuthProvider } from '@/features/auth/model/AuthContext';
import { Router } from '@/router/Router';

export const App = () => {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};
