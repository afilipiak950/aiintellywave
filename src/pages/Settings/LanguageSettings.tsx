
import { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { Language } from '../../utils/languageTypes';
import { getCurrentLanguage, setAppLanguage } from '../../utils/languageUtils';

interface LanguageSettingsProps {
  onLanguageChange?: (language: Language) => void;
}

const LanguageSettings = ({ onLanguageChange }: LanguageSettingsProps) => {
  const { language, t } = useTranslation();
  
  useEffect(() => {
    // If there is an external handler for language changes
    if (onLanguageChange) {
      const handleLanguageChange = (event: CustomEvent) => {
        onLanguageChange(event.detail.language);
      };
      
      window.addEventListener('app-language-change', handleLanguageChange as EventListener);
      
      return () => {
        window.removeEventListener('app-language-change', handleLanguageChange as EventListener);
      };
    }
  }, [onLanguageChange]);
  
  // Handle language selection from the toggle or select components
  const handleLanguageChange = (value: string) => {
    const newLanguage = value as Language;
    setAppLanguage(newLanguage);
    
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">
          {t('language')}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('selectYourPreferredLanguage')}
        </p>
      </div>
      
      {/* Language switcher simple version */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Dropdown Switcher</h3>
        <LanguageSwitcher 
          variant="outline" 
          size="default" 
          showLabel={true} 
          className="w-[180px]"
        />
      </div>
      
      {/* Toggle group for larger screens */}
      <div className="mb-6 hidden md:block">
        <h3 className="text-sm font-medium mb-2">Language Toggle</h3>
        <ToggleGroup 
          type="single" 
          value={language} 
          onValueChange={value => value && handleLanguageChange(value)}
          className="justify-start"
        >
          <ToggleGroupItem value="en" aria-label="English">
            <span className={cn("font-medium", language === "en" ? "text-primary" : "")}>English</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="de" aria-label="German">
            <span className={cn("font-medium", language === "de" ? "text-primary" : "")}>Deutsch</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="fr" aria-label="French">
            <span className={cn("font-medium", language === "fr" ? "text-primary" : "")}>Français</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="es" aria-label="Spanish">
            <span className={cn("font-medium", language === "es" ? "text-primary" : "")}>Español</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Select dropdown for mobile/smaller screens */}
      <div className="mb-6 md:hidden">
        <h3 className="text-sm font-medium mb-2">Select Language</h3>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full">
            <Globe className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="es">Español</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LanguageSettings;
