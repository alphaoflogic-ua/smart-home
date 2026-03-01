import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { Card } from '@/shared/ui/Card/Card';
import { useNavigate } from 'react-router-dom';

export const CreateAdminForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.register.error_mismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await register({ email, password });
      // After registration, try to login automatically
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.register.error_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-text-primary">{t('auth.register.title')}</h1>
          <p className="text-text-secondary">
            {t('auth.register.subtitle')}
          </p>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            {error}
          </div>
        )}

        <Input
          label={t('auth.register.email_label')}
          type="email"
          placeholder={t('auth.register.email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          label={t('auth.register.password_label')}
          type="password"
          placeholder={t('auth.register.password_placeholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <Input
          label={t('auth.register.confirm_password_label')}
          type="password"
          placeholder={t('auth.register.password_placeholder')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>
      </form>
    </Card>
  );
};
