import { Link, useLocation } from 'react-router-dom';
import { Home, Cpu, Settings, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Devices', href: '/devices', icon: Cpu },
  { name: 'Automations', href: '/automations', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 shrink-0 transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
