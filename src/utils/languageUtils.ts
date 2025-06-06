
import { Language, APP_LANGUAGE_KEY } from './languageTypes';
import translations from './translations';

export const getInitialLanguage = (): Language => {
  const storedLanguage = localStorage.getItem(APP_LANGUAGE_KEY);
  return (storedLanguage && ['en', 'de', 'fr', 'es'].includes(storedLanguage)) ? storedLanguage as Language : 'en';
};

export const setAppLanguage = (language: Language) => {
  // Always validate the language code to ensure it's supported
  if (['en', 'de', 'fr', 'es'].includes(language)) {
    localStorage.setItem(APP_LANGUAGE_KEY, language);
    
    // Dispatch a custom event to notify components of the language change
    const event = new CustomEvent('app-language-change', { detail: { language } });
    window.dispatchEvent(event);
    
    // Reload the page to ensure all components update with the new language
    // This ensures even deeply nested components will reflect the language change
    window.location.reload();
  } else {
    console.warn(`Invalid language code: ${language}, defaulting to English`);
    localStorage.setItem(APP_LANGUAGE_KEY, 'en');
  }
};

export const getCurrentLanguage = (): Language => {
  const storedLanguage = localStorage.getItem(APP_LANGUAGE_KEY);
  // Always default to English if no language is set
  return (storedLanguage && ['en', 'de', 'fr', 'es'].includes(storedLanguage)) ? storedLanguage as Language : 'en';
};

export const getTranslation = (language: Language, key: keyof typeof translations.en): string => {
  return translations[language]?.[key] || translations.en[key];
};
