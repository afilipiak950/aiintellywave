
import { useState, useEffect } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { useAuth } from '../../context/auth';
import { useUserSettings } from '../../hooks/use-user-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const LanguageSettings = () => {
  const { user } = useAuth();
  const { settings, updateSettings, loading } = useUserSettings();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
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
    if (!loading && settings) {
      setSelectedLanguage(settings.language || 'en');
    }
  }, [settings, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    await updateSettings({
      language: selectedLanguage
    });
    
    setIsSaving(false);
  };

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Language Settings</h1>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Language Preference</CardTitle>
                <CardDescription>Select your preferred language for the application interface</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={selectedLanguage} 
                  onValueChange={setSelectedLanguage}
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
                        Saving
                      </>
                    ) : 'Save Changes'}
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
