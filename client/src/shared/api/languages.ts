import { type SelectOption } from '@/shared/ui/Select/Select';

export const fetchLanguages = async (): Promise<SelectOption[]> => {
  const response = await fetch('/locales/languages.json');
  if (!response.ok) {
    throw new Error('Failed to load languages');
  }
  return response.json();
};
