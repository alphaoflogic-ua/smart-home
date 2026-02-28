import { type ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export const Card = ({ children, className, title }: CardProps) => {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900', className)}>
      {title && <h3 className="mb-4 text-lg font-semibold dark:text-gray-100">{title}</h3>}
      {children}
    </div>
  );
};
