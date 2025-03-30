
import { useState, useEffect } from 'react';
import { Language, TranslationDict, APP_LANGUAGE_KEY } from '../utils/languageTypes';
import { getCurrentLanguage, getTranslation } from '../utils/languageUtils';
import translations from '../utils/translations';

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

  // Enhanced translation function that falls back correctly and converts to uppercase for sidebar items
  const t = (key: keyof TranslationDict): string => {
    if (!key) return '';
    
    // First try to get the translation from the current language
    const translation = translationDict[key];
    
    // If not found, fall back to English
    if (!translation && language !== 'en') {
      return translations.en[key]?.toUpperCase() || key.toString().toUpperCase();
    }
    
    return translation?.toUpperCase() || key.toString().toUpperCase();
  };

  return { language, t, translationDict };
}
