import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export type SelectOption = {
  id: string;
  name: string;
};

export type SelectProps = {
  options: SelectOption[];
  value: SelectOption;
  onChange: (value: SelectOption) => void;
  className?: string;
};

export const Select = ({ options, value, onChange, className }: SelectProps) => {
  return (
    <div className={cn('relative w-32', className)}>
      <Listbox value={value} onChange={onChange}>
        <ListboxButton className="relative w-full cursor-default rounded-md border border-border-base bg-bg-surface py-1.5 pl-3 pr-10 text-left text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <span className="block truncate">{value.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-text-secondary">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </span>
        </ListboxButton>
        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-bg-surface py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:opacity-0"
        >
          {options.map((option) => (
            <ListboxOption
              key={option.id}
              value={option}
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-text-primary data-[focus]:bg-brand-primary data-[focus]:text-white"
            >
              <span className="block truncate font-normal group-data-[selected]:font-semibold">
                {option.name}
              </span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-primary group-data-[focus]:text-white group-[&:not([data-selected])]:hidden">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};
