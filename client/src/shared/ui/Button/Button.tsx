import { Button as HeadlessButton } from '@headlessui/react';
import { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white data-[hover]:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 data-[hover]:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:data-[hover]:bg-gray-600',
      ghost: 'bg-transparent data-[hover]:bg-gray-100 dark:data-[hover]:bg-gray-800',
      danger: 'bg-red-600 text-white data-[hover]:bg-red-700',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <HeadlessButton
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none data-[focus]:ring-2 data-[focus]:ring-blue-500',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
