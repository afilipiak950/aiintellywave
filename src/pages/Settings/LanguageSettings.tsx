
import { useState, useEffect } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { useAuth } from '../../context/auth';
import { useUserSettings } from '../../hooks/use-user-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

// Translation dictionaries for basic UI elements
const translations = {
  en: {
    welcome: 'Welcome back',
    overview: 'Here is an overview of your customer portal.',
    languageSettings: 'Language Settings',
    languagePreference: 'Language Preference',
    selectLanguage: 'Select your preferred language for the application interface',
    saveChanges: 'Save Changes',
    saving: 'Saving',
    successTitle: 'Language updated',
    successMessage: 'Your language preference has been updated',
  },
  de: {
    welcome: 'Willkommen zurück',
    overview: 'Hier ist eine Übersicht Ihres Kundenportals.',
    languageSettings: 'Spracheinstellungen',
    languagePreference: 'Spracheinstellung',
    selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache für die Anwendungsoberfläche',
    saveChanges: 'Änderungen speichern',
    saving: 'Speichern',
    successTitle: 'Sprache aktualisiert',
    successMessage: 'Ihre Spracheinstellung wurde aktualisiert',
  },
  fr: {
    welcome: 'Bienvenue',
    overview: "Voici un aperçu de votre portail client.",
    languageSettings: 'Paramètres de langue',
    languagePreference: 'Préférence de langue',
    selectLanguage: "Sélectionnez votre langue préférée pour l'interface de l'application",
    saveChanges: 'Enregistrer les modifications',
    saving: 'Enregistrement',
    successTitle: 'Langue mise à jour',
    successMessage: 'Votre préférence linguistique a été mise à jour',
  },
  es: {
    welcome: 'Bienvenido de nuevo',
    overview: 'Aquí hay una descripción general de su portal de cliente.',
    languageSettings: 'Configuración de idioma',
    languagePreference: 'Preferencia de idioma',
    selectLanguage: 'Seleccione su idioma preferido para la interfaz de la aplicación',
    saveChanges: 'Guardar cambios',
    saving: 'Guardando',
    successTitle: 'Idioma actualizado',
    successMessage: 'Su preferencia de idioma ha sido actualizada',
  },
};

// Type definitions for our translations
export type Language = 'en' | 'de' | 'fr' | 'es';
export type TranslationDict = typeof translations.en;

// Global access to translations
export const getTranslation = (lang: Language, key: keyof TranslationDict): string => {
  return translations[lang]?.[key] || translations.en[key];
};

// Create a global variable to store the current language
// This can be accessed by components that need translations
let currentLanguage: Language = 'en';

export const getCurrentLanguage = (): Language => currentLanguage;
export const setCurrentLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('APP_LANGUAGE', lang);
  document.documentElement.lang = lang;
  // Dispatch an event that other components can listen for
  window.dispatchEvent(new CustomEvent('app-language-change', { detail: { language: lang } }));
};

const LanguageSettings = () => {
  const { user } = useAuth();
  const { settings, updateSettings, loading } = useUserSettings();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine base path based on user role
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();
  
  useEffect(() => {
    // Initialize from local storage or settings
    const storedLang = localStorage.getItem('APP_LANGUAGE');
    if (storedLang && ['en', 'de', 'fr', 'es'].includes(storedLang)) {
      setSelectedLanguage(storedLang as Language);
      setCurrentLanguage(storedLang as Language);
    } else if (!loading && settings && settings.language) {
      // If no local storage value, use the one from database
      const dbLang = settings.language;
      if (['en', 'de', 'fr', 'es'].includes(dbLang)) {
        setSelectedLanguage(dbLang as Language);
        setCurrentLanguage(dbLang as Language);
        localStorage.setItem('APP_LANGUAGE', dbLang);
      }
    }
  }, [settings, loading]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Update the setting in Supabase
      await updateSettings({
        language: selectedLanguage
      });
      
      // Update the local language state
      setCurrentLanguage(selectedLanguage);
      
      toast({
        title: getTranslation(selectedLanguage, 'successTitle'),
        description: getTranslation(selectedLanguage, 'successMessage')
      });
    } catch (error) {
      console.error('Error updating language setting:', error);
      toast({
        title: "Error",
        description: "Failed to update language. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Get translations for the current selected language
  const t = (key: keyof TranslationDict) => getTranslation(selectedLanguage, key);

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('languageSettings')}</h1>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>{t('languagePreference')}</CardTitle>
                <CardDescription>{t('selectLanguage')}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={selectedLanguage} 
                  onValueChange={(value) => setSelectedLanguage(value as Language)}
                  className="space-y-3"
                >
                  {languages.map((language) => (
                    <div 
                      key={language.code}
                      className={`flex items-center space-x-3 p-3 rounded-md border transition-colors ${
                        selectedLanguage === language.code ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={language.code} id={`language-${language.code}`} />
                      <Label 
                        htmlFor={`language-${language.code}`}
                        className="flex items-center cursor-pointer flex-1"
                      >
                        <span className="text-xl mr-3">{language.flag}</span>
                        <span>{language.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {t('saving')}
                      </>
                    ) : t('saveChanges')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </SettingsLayout>
  );
};

export default LanguageSettings;
