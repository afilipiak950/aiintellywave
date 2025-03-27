
import { useState, useEffect } from 'react';
import { Language } from '../../utils/languageTypes';
import { getCurrentLanguage, getTranslation, setAppLanguage } from '../../utils/languageUtils';

interface LanguageSettingsProps {
  onLanguageChange?: (language: Language) => void;
}

const LanguageSettings = ({ onLanguageChange }: LanguageSettingsProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getCurrentLanguage());
  
  useEffect(() => {
    // Set initial language from localStorage or default
    const storedLang = localStorage.getItem('APP_LANGUAGE') as Language || 'en';
    setSelectedLanguage(storedLang);
  }, []);
  
  const handleLanguageChange = (newLanguage: Language) => {
    setSelectedLanguage(newLanguage);
    setAppLanguage(newLanguage);
    
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        {getTranslation(selectedLanguage, 'language')}
      </h2>
      
      <div className="flex items-center space-x-4">
        <label htmlFor="language">Select Language:</label>
        <select
          id="language"
          className="border p-2 rounded"
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
        >
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
  );
};

export default LanguageSettings;
