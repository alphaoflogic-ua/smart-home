import { LoginForm } from '@/features/auth/ui/LoginForm';
import { CreateAdminForm } from '@/features/auth/ui/CreateAdminForm';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const AuthPage = () => {
  const { hasAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {hasAdmin === false ? <CreateAdminForm /> : <LoginForm />}
    </div>
  );
};
