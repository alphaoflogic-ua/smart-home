import { forwardRef } from 'react';
import { Field, Label, Input as HeadlessInput, Description } from '@headlessui/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  label?: string;
  error?: string;
  description?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, description, ...props }, ref) => {
    return (
      <Field className="w-full">
        {label && (
          <Label className="block text-sm font-medium text-text-primary mb-1">
            {label}
          </Label>
        )}
        <HeadlessInput
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-border-base bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none data-focus:ring-2 data-focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 data-focus:ring-red-500',
            className
          )}
          {...props}
        />
        {description && (
          <Description className="mt-1 text-xs text-text-secondary">
            {description}
          </Description>
        )}
        {error && <Description className="mt-1 text-xs text-red-500">{error}</Description>}
      </Field>
    );
  }
);

Input.displayName = 'Input';
