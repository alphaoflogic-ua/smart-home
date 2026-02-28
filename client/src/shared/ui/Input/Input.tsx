import { forwardRef } from 'react';
import { Field, Label, Input as HeadlessInput, Description } from '@headlessui/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string;
  description?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, description, ...props }, ref) => {
    return (
      <Field className="w-full">
        {label && (
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </Label>
        )}
        <HeadlessInput
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none data-[focus]:ring-2 data-[focus]:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-100',
            error && 'border-red-500 data-[focus]:ring-red-500',
            className
          )}
          {...props}
        />
        {description && (
          <Description className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </Description>
        )}
        {error && <Description className="mt-1 text-xs text-red-500">{error}</Description>}
      </Field>
    );
  }
);

Input.displayName = 'Input';
