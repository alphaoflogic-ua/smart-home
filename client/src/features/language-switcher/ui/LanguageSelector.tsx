import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, type SelectOption } from '@/shared/ui/Select/Select';
import { fetchLanguages } from '@/shared/api/languages';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [languages, setLanguages] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const data = await fetchLanguages();
        setLanguages(data);
      } catch (error) {
        console.error('Failed to load languages', error);
        // Fallback languages if fetch fails
        setLanguages([
          { id: 'en', name: 'English' },
          { id: 'ua', name: 'Українська' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguages();
  }, []);

  const currentLanguage =
    languages.find((lang) => lang.id === i18n.language) ||
    languages.find((lang) => lang.id === i18n.options.fallbackLng) ||
    languages[0];

  const handleLanguageChange = (option: SelectOption) => {
    i18n.changeLanguage(option.id);
  };

  if (isLoading || languages.length === 0) {
    return (
      <div className="w-36 h-9 animate-pulse rounded-md bg-bg-surface border border-border-base" />
    );
  }

  return (
    <Select
      options={languages}
      value={currentLanguage!}
      onChange={handleLanguageChange}
      className="w-36"
    />
  );
};
