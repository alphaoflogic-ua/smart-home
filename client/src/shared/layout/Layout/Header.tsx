import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/ui/Button/Button';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="text-lg font-semibold">Smart Home</div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-gray-500">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
