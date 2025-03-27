
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth';
import { getCurrentLanguage, getTranslation, type Language, type TranslationDict } from '../../../pages/Settings/LanguageSettings';

interface WelcomeSectionProps {
  className?: string;
}

const WelcomeSection = ({ className = '' }: WelcomeSectionProps) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());
  
  // Function to translate based on current language
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);
  
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
  
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">{t('welcome')}, {user?.firstName || 'Kunde'}</h1>
      <p className="text-gray-600 mt-1">{t('overview')}</p>
    </div>
  );
};

export default WelcomeSection;
