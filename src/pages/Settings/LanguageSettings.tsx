import { useState, useEffect } from 'react';

export const APP_LANGUAGE_KEY = 'APP_LANGUAGE';

export const getInitialLanguage = (): string => {
  const storedLanguage = localStorage.getItem(APP_LANGUAGE_KEY);
  return storedLanguage && ['en', 'de', 'fr', 'es'].includes(storedLanguage) ? storedLanguage : 'en';
};

export const setAppLanguage = (language: string) => {
  if (['en', 'de', 'fr', 'es'].includes(language)) {
    localStorage.setItem(APP_LANGUAGE_KEY, language);
    
    // Dispatch a custom event to notify components of the language change
    const event = new CustomEvent('app-language-change', { detail: { language } });
    window.dispatchEvent(event);
  } else {
    console.warn(`Invalid language code: ${language}`);
  }
};

export const getCurrentLanguage = (): string => {
  return localStorage.getItem(APP_LANGUAGE_KEY) || 'en';
};

export type Language = 'en' | 'de' | 'fr' | 'es';

export type TranslationDict = {
  welcome: string;
  overview: string;
  settings: string;
  language: string;
  theme: string;
  notifications: string;
  security: string;
  profile: string;
  team: string;
  appearance: string;
  comingSoon: string;
  outreachFeature: string;
  description: string;
  stayUpdated: string;
  emailPlaceholder: string;
  notifyMe: string;
  thankYou: string;
  alreadyRegistered: string;
  enterEmail: string;
};

const translations: Record<Language, TranslationDict> = {
  en: {
    welcome: 'Welcome',
    overview: 'Here is an overview of your dashboard',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    security: 'Security',
    profile: 'Profile',
    team: 'Team',
    appearance: 'Appearance',
    comingSoon: 'Coming Soon',
    outreachFeature: 'Outreach Feature',
    description: 'We\'re working on something exciting! Our new outreach platform will help you connect with your audience like never before.',
    stayUpdated: 'Stay Updated',
    emailPlaceholder: 'Enter your email',
    notifyMe: 'Notify Me',
    thankYou: 'Thank you! We\'ll notify you when we launch.',
    alreadyRegistered: 'You\'re already registered for updates!',
    enterEmail: 'Please enter a valid email address'
  },
  de: {
    welcome: 'Willkommen',
    overview: 'Hier ist ein Überblick über Ihr Dashboard',
    settings: 'Einstellungen',
    language: 'Sprache',
    theme: 'Thema',
    notifications: 'Benachrichtigungen',
    security: 'Sicherheit',
    profile: 'Profil',
    team: 'Team',
    appearance: 'Erscheinungsbild',
    comingSoon: 'In Entwicklung',
    outreachFeature: 'Outreach-Funktion',
    description: 'Wir arbeiten an etwas Aufregendem! Unsere neue Outreach-Plattform wird Ihnen helfen, sich mit Ihrem Publikum wie nie zuvor zu verbinden.',
    stayUpdated: 'Bleiben Sie auf dem Laufenden',
    emailPlaceholder: 'E-Mail-Adresse eingeben',
    notifyMe: 'Benachrichtigen Sie mich',
    thankYou: 'Vielen Dank! Wir werden Sie benachrichtigen, wenn wir starten.',
    alreadyRegistered: 'Sie sind bereits für Updates registriert!',
    enterEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
  },
  fr: {
    welcome: 'Bienvenue',
    overview: 'Voici un aperçu de votre tableau de bord',
    settings: 'Paramètres',
    language: 'Langue',
    theme: 'Thème',
    notifications: 'Notifications',
    security: 'Sécurité',
    profile: 'Profil',
    team: 'Équipe',
    appearance: 'Apparence',
    comingSoon: 'Bientôt Disponible',
    outreachFeature: 'Fonctionnalité de Sensibilisation',
    description: 'Nous travaillons sur quelque chose d\'excitant ! Notre nouvelle plateforme de sensibilisation vous aidera à vous connecter avec votre audience comme jamais auparavant.',
    stayUpdated: 'Restez Informé',
    emailPlaceholder: 'Entrez votre email',
    notifyMe: 'Me Notifier',
    thankYou: 'Merci ! Nous vous informerons lors du lancement.',
    alreadyRegistered: 'Vous êtes déjà inscrit pour les mises à jour !',
    enterEmail: 'Veuillez entrer une adresse email valide'
  },
  es: {
    welcome: 'Bienvenido',
    overview: 'Aquí hay una visión general de su tablero',
    settings: 'Configuración',
    language: 'Idioma',
    theme: 'Tema',
    notifications: 'Notificaciones',
    security: 'Seguridad',
    profile: 'Perfil',
    team: 'Equipo',
    appearance: 'Apariencia',
    comingSoon: 'Próximamente',
    outreachFeature: 'Función de Divulgación',
    description: '¡Estamos trabajando en algo emocionante! Nuestra nueva plataforma de divulgación le ayudará a conectarse con su audiencia como nunca antes.',
    stayUpdated: 'Manténgase Actualizado',
    emailPlaceholder: 'Introduzca su correo electrónico',
    notifyMe: 'Notifíqueme',
    thankYou: '¡Gracias! Le notificaremos cuando lancemos.',
    alreadyRegistered: '¡Ya está registrado para recibir actualizaciones!',
    enterEmail: 'Por favor, introduzca una dirección de correo electrónico válida'
  }
};

export const getTranslation = (language: Language, key: keyof TranslationDict): string => {
  return translations[language]?.[key] || translations.en[key];
};

interface LanguageSettingsProps {
  onLanguageChange?: (language: string) => void;
}

const LanguageSettings = ({ onLanguageChange }: LanguageSettingsProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(getCurrentLanguage());
  
  useEffect(() => {
    // Set initial language from localStorage or default
    const storedLang = localStorage.getItem('APP_LANGUAGE') || 'en';
    setSelectedLanguage(storedLang);
  }, []);
  
  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setAppLanguage(newLanguage);
    
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        {getTranslation(selectedLanguage as Language, 'language')}
      </h2>
      
      <div className="flex items-center space-x-4">
        <label htmlFor="language">Select Language:</label>
        <select
          id="language"
          className="border p-2 rounded"
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
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
