import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/ui/Button/Button';
import { ThemeToggle } from '@/shared/ui/ThemeToggle/ThemeToggle';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border-base bg-bg-surface px-6">
      <div className="text-lg font-semibold text-text-primary">Smart Home</div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {user && (
          <>
            <span className="text-sm text-text-secondary">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
