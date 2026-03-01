import { Switch as HeadlessSwitch, Field, Label } from '@headlessui/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
};

export const Switch = ({ checked, onChange, className, label }: SwitchProps) => {
  return (
    <Field className={cn('flex items-center gap-3', className)}>
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:ring-2 data-[focus]:ring-blue-600 data-[focus]:ring-offset-2',
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </HeadlessSwitch>
      {label && (
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
          {label}
        </Label>
      )}
    </Field>
  );
};
