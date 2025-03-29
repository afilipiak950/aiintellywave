
import { useState, useEffect } from 'react';
import { Check, Globe } from 'lucide-react';
import { Language } from '../../utils/languageTypes';
import { getCurrentLanguage, setAppLanguage } from '../../utils/languageUtils';
import { useTranslation } from '../../hooks/useTranslation';

// Components from shadcn/ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Language options with their display names
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({ 
  variant = 'outline', 
  size = 'default', 
  showLabel = true,
  className 
}: LanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getCurrentLanguage());
  const { t } = useTranslation();
  
  // Initialize with the current language
  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
    
    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };
    
    window.addEventListener('app-language-change', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('app-language-change', handleLanguageChange as EventListener);
    };
  }, []);
  
  // Get the current language display name
  const currentLanguageName = LANGUAGES.find(lang => lang.code === currentLanguage)?.name || 'English';
  
  // Handle language selection
  const handleSelectLanguage = (language: Language) => {
    if (language !== currentLanguage) {
      setAppLanguage(language);
      setCurrentLanguage(language);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Globe className="h-4 w-4 mr-2" />
          {showLabel && (currentLanguageName || t('language'))}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code as Language)}
            className="flex items-center justify-between"
          >
            {lang.name}
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4 text-primary ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
