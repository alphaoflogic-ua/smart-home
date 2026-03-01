import { type ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
};

export const Card = ({ children, className, title }: CardProps) => {
  return (
    <div className={cn('rounded-lg border border-border-base bg-bg-surface p-6 shadow-sm', className)}>
      {title && <h3 className="mb-4 text-lg font-semibold text-text-primary">{title}</h3>}
      {children}
    </div>
  );
};
