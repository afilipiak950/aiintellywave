
import { useState, useEffect } from 'react';
import { Language } from '../utils/languageTypes';
import { getCurrentLanguage, getTranslation } from '../utils/languageUtils';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());

  // Function to translate based on current language
  const t = (key: Parameters<typeof getTranslation>[1]): string => getTranslation(language, key);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language);
    };
    
    // Initial language from localStorage or default
    const storedLang = localStorage.getItem('APP_LANGUAGE') as Language;
    if (storedLang && ['en', 'de', 'fr', 'es'].includes(storedLang)) {
      setLanguage(storedLang);
    }
    
    // Listen for language change events
    window.addEventListener('app-language-change', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('app-language-change', handleLanguageChange as EventListener);
    };
  }, []);

  return { language, t };
}
