
import { useState, useEffect } from 'react';
import { Language, TranslationDict, APP_LANGUAGE_KEY } from '../utils/languageTypes';
import { getCurrentLanguage, getTranslation } from '../utils/languageUtils';
import { translations } from '../utils/translations';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());

  // Get the current language's translation dictionary
  const translationDict = translations[language] as TranslationDict;

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language);
    };
    
    // Initial language from localStorage or default
    const storedLang = localStorage.getItem(APP_LANGUAGE_KEY) as Language;
    if (storedLang && ['en', 'de', 'fr', 'es'].includes(storedLang)) {
      setLanguage(storedLang);
    }
    
    // Listen for language change events
    window.addEventListener('app-language-change', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('app-language-change', handleLanguageChange as EventListener);
    };
  }, []);

  // Function to translate based on current language (for backward compatibility)
  const t = (key: keyof TranslationDict): string => translationDict[key] || key;

  return { language, t, translationDict };
}
