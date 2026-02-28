import { type ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();

  if (!user) {
    return <div className="min-h-screen bg-gray-50 dark:bg-black">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};
