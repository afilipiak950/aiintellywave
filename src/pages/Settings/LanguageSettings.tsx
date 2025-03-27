
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export type Language = 'en' | 'de' | 'fr' | 'es';

export interface TranslationDict {
  // Common
  dashboard: string;
  projects: string;
  settings: string;
  logout: string;
  profile: string;
  language: string;
  appearance: string;
  notifications: string;
  security: string;
  dark: string;
  light: string;
  system: string;
  theme: string;
  themeDesc: string;
  save: string;
  saved: string;
  cancel: string;
  preview: string;
  
  // Project related
  projectName: string;
  projectStatus: string;
  projectDeadline: string;
  projectDescription: string;
  projectManager: string;
  projectClient: string;
  
  // Navigation
  back: string;
  next: string;
  previous: string;
  
  // Authentication
  login: string;
  register: string;
  email: string;
  password: string;
  forgotPassword: string;
  rememberMe: string;
  
  // Customer portal
  appointments: string;
  messages: string;
  statistics: string;
  
  // Settings
  selectLanguage: string;
  languageSettings: string;
  changeLanguage: string;
  currentLanguage: string;
  
  // Profile
  firstName: string;
  lastName: string;
  company: string;
  phoneNumber: string;
  address: string;
  
  // Notifications
  emailNotifications: string;
  pushNotifications: string;
  notificationFrequency: string;
  
  // Security
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorAuth: string;
  enableTwoFactor: string;
  disableTwoFactor: string;
  sessions: string;
  manageSessions: string;
  
  // Teams
  teamMembers: string;
  addMember: string;
  removeMember: string;
  role: string;
  
  // AI Features
  miraAI: string;
  
  // Outreach
  outreach: string;
}

// Default English translations
const en: TranslationDict = {
  // Common
  dashboard: 'Dashboard',
  projects: 'Projects',
  settings: 'Settings',
  logout: 'Logout',
  profile: 'Profile',
  language: 'Language',
  appearance: 'Appearance',
  notifications: 'Notifications',
  security: 'Security',
  dark: 'Dark',
  light: 'Light',
  system: 'System',
  theme: 'Theme',
  themeDesc: 'Select your preferred theme',
  save: 'Save',
  saved: 'Saved',
  cancel: 'Cancel',
  preview: 'Preview',
  
  // Project related
  projectName: 'Project Name',
  projectStatus: 'Status',
  projectDeadline: 'Deadline',
  projectDescription: 'Description',
  projectManager: 'Project Manager',
  projectClient: 'Client',
  
  // Navigation
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  
  // Authentication
  login: 'Login',
  register: 'Register',
  email: 'Email',
  password: 'Password',
  forgotPassword: 'Forgot Password',
  rememberMe: 'Remember Me',
  
  // Customer portal
  appointments: 'Appointments',
  messages: 'Messages',
  statistics: 'Statistics',
  
  // Settings
  selectLanguage: 'Select Language',
  languageSettings: 'Language Settings',
  changeLanguage: 'Change Language',
  currentLanguage: 'Current Language',
  
  // Profile
  firstName: 'First Name',
  lastName: 'Last Name',
  company: 'Company',
  phoneNumber: 'Phone Number',
  address: 'Address',
  
  // Notifications
  emailNotifications: 'Email Notifications',
  pushNotifications: 'Push Notifications',
  notificationFrequency: 'Notification Frequency',
  
  // Security
  changePassword: 'Change Password',
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  confirmPassword: 'Confirm Password',
  twoFactorAuth: 'Two-Factor Authentication',
  enableTwoFactor: 'Enable Two-Factor',
  disableTwoFactor: 'Disable Two-Factor',
  sessions: 'Sessions',
  manageSessions: 'Manage Sessions',
  
  // Teams
  teamMembers: 'Team Members',
  addMember: 'Add Member',
  removeMember: 'Remove Member',
  role: 'Role',
  
  // AI Features
  miraAI: 'Mira AI',
  
  // Outreach
  outreach: 'Outreach',
};

// German translations
const de: TranslationDict = {
  // Common
  dashboard: 'Dashboard',
  projects: 'Projekte',
  settings: 'Einstellungen',
  logout: 'Abmelden',
  profile: 'Profil',
  language: 'Sprache',
  appearance: 'Aussehen',
  notifications: 'Benachrichtigungen',
  security: 'Sicherheit',
  dark: 'Dunkel',
  light: 'Hell',
  system: 'System',
  theme: 'Thema',
  themeDesc: 'Wählen Sie Ihr bevorzugtes Thema',
  save: 'Speichern',
  saved: 'Gespeichert',
  cancel: 'Abbrechen',
  preview: 'Vorschau',
  
  // Project related
  projectName: 'Projektname',
  projectStatus: 'Status',
  projectDeadline: 'Frist',
  projectDescription: 'Beschreibung',
  projectManager: 'Projektmanager',
  projectClient: 'Kunde',
  
  // Navigation
  back: 'Zurück',
  next: 'Weiter',
  previous: 'Zurück',
  
  // Authentication
  login: 'Anmelden',
  register: 'Registrieren',
  email: 'E-Mail',
  password: 'Passwort',
  forgotPassword: 'Passwort vergessen',
  rememberMe: 'Angemeldet bleiben',
  
  // Customer portal
  appointments: 'Termine',
  messages: 'Nachrichten',
  statistics: 'Statistiken',
  
  // Settings
  selectLanguage: 'Sprache auswählen',
  languageSettings: 'Spracheinstellungen',
  changeLanguage: 'Sprache ändern',
  currentLanguage: 'Aktuelle Sprache',
  
  // Profile
  firstName: 'Vorname',
  lastName: 'Nachname',
  company: 'Unternehmen',
  phoneNumber: 'Telefonnummer',
  address: 'Adresse',
  
  // Notifications
  emailNotifications: 'E-Mail-Benachrichtigungen',
  pushNotifications: 'Push-Benachrichtigungen',
  notificationFrequency: 'Benachrichtigungshäufigkeit',
  
  // Security
  changePassword: 'Passwort ändern',
  currentPassword: 'Aktuelles Passwort',
  newPassword: 'Neues Passwort',
  confirmPassword: 'Passwort bestätigen',
  twoFactorAuth: 'Zwei-Faktor-Authentifizierung',
  enableTwoFactor: 'Zwei-Faktor aktivieren',
  disableTwoFactor: 'Zwei-Faktor deaktivieren',
  sessions: 'Sitzungen',
  manageSessions: 'Sitzungen verwalten',
  
  // Teams
  teamMembers: 'Teammitglieder',
  addMember: 'Mitglied hinzufügen',
  removeMember: 'Mitglied entfernen',
  role: 'Rolle',
  
  // AI Features
  miraAI: 'Mira KI',
  
  // Outreach
  outreach: 'Outreach',
};

// French translations
const fr: TranslationDict = {
  // Common
  dashboard: 'Tableau de Bord',
  projects: 'Projets',
  settings: 'Paramètres',
  logout: 'Déconnexion',
  profile: 'Profil',
  language: 'Langue',
  appearance: 'Apparence',
  notifications: 'Notifications',
  security: 'Sécurité',
  dark: 'Sombre',
  light: 'Clair',
  system: 'Système',
  theme: 'Thème',
  themeDesc: 'Sélectionnez votre thème préféré',
  save: 'Enregistrer',
  saved: 'Enregistré',
  cancel: 'Annuler',
  preview: 'Aperçu',
  
  // Project related
  projectName: 'Nom du Projet',
  projectStatus: 'Statut',
  projectDeadline: 'Échéance',
  projectDescription: 'Description',
  projectManager: 'Chef de Projet',
  projectClient: 'Client',
  
  // Navigation
  back: 'Retour',
  next: 'Suivant',
  previous: 'Précédent',
  
  // Authentication
  login: 'Connexion',
  register: 'Inscription',
  email: 'Email',
  password: 'Mot de Passe',
  forgotPassword: 'Mot de Passe Oublié',
  rememberMe: 'Se Souvenir de Moi',
  
  // Customer portal
  appointments: 'Rendez-vous',
  messages: 'Messages',
  statistics: 'Statistiques',
  
  // Settings
  selectLanguage: 'Sélectionner la Langue',
  languageSettings: 'Paramètres de Langue',
  changeLanguage: 'Changer de Langue',
  currentLanguage: 'Langue Actuelle',
  
  // Profile
  firstName: 'Prénom',
  lastName: 'Nom',
  company: 'Entreprise',
  phoneNumber: 'Numéro de Téléphone',
  address: 'Adresse',
  
  // Notifications
  emailNotifications: 'Notifications par Email',
  pushNotifications: 'Notifications Push',
  notificationFrequency: 'Fréquence des Notifications',
  
  // Security
  changePassword: 'Changer le Mot de Passe',
  currentPassword: 'Mot de Passe Actuel',
  newPassword: 'Nouveau Mot de Passe',
  confirmPassword: 'Confirmer le Mot de Passe',
  twoFactorAuth: 'Authentification à Deux Facteurs',
  enableTwoFactor: 'Activer la Double Authentification',
  disableTwoFactor: 'Désactiver la Double Authentification',
  sessions: 'Sessions',
  manageSessions: 'Gérer les Sessions',
  
  // Teams
  teamMembers: 'Membres de l\'Équipe',
  addMember: 'Ajouter un Membre',
  removeMember: 'Supprimer un Membre',
  role: 'Rôle',
  
  // AI Features
  miraAI: 'Mira IA',
  
  // Outreach
  outreach: 'Communication',
};

// Spanish translations
const es: TranslationDict = {
  // Common
  dashboard: 'Panel de Control',
  projects: 'Proyectos',
  settings: 'Configuración',
  logout: 'Cerrar Sesión',
  profile: 'Perfil',
  language: 'Idioma',
  appearance: 'Apariencia',
  notifications: 'Notificaciones',
  security: 'Seguridad',
  dark: 'Oscuro',
  light: 'Claro',
  system: 'Sistema',
  theme: 'Tema',
  themeDesc: 'Seleccione su tema preferido',
  save: 'Guardar',
  saved: 'Guardado',
  cancel: 'Cancelar',
  preview: 'Vista Previa',
  
  // Project related
  projectName: 'Nombre del Proyecto',
  projectStatus: 'Estado',
  projectDeadline: 'Fecha Límite',
  projectDescription: 'Descripción',
  projectManager: 'Gerente de Proyecto',
  projectClient: 'Cliente',
  
  // Navigation
  back: 'Atrás',
  next: 'Siguiente',
  previous: 'Anterior',
  
  // Authentication
  login: 'Iniciar Sesión',
  register: 'Registrarse',
  email: 'Correo Electrónico',
  password: 'Contraseña',
  forgotPassword: 'Olvidé mi Contraseña',
  rememberMe: 'Recordarme',
  
  // Customer portal
  appointments: 'Citas',
  messages: 'Mensajes',
  statistics: 'Estadísticas',
  
  // Settings
  selectLanguage: 'Seleccionar Idioma',
  languageSettings: 'Configuración de Idioma',
  changeLanguage: 'Cambiar Idioma',
  currentLanguage: 'Idioma Actual',
  
  // Profile
  firstName: 'Nombre',
  lastName: 'Apellido',
  company: 'Empresa',
  phoneNumber: 'Número de Teléfono',
  address: 'Dirección',
  
  // Notifications
  emailNotifications: 'Notificaciones por Correo',
  pushNotifications: 'Notificaciones Push',
  notificationFrequency: 'Frecuencia de Notificaciones',
  
  // Security
  changePassword: 'Cambiar Contraseña',
  currentPassword: 'Contraseña Actual',
  newPassword: 'Nueva Contraseña',
  confirmPassword: 'Confirmar Contraseña',
  twoFactorAuth: 'Autenticación de Dos Factores',
  enableTwoFactor: 'Activar Doble Autenticación',
  disableTwoFactor: 'Desactivar Doble Autenticación',
  sessions: 'Sesiones',
  manageSessions: 'Gestionar Sesiones',
  
  // Teams
  teamMembers: 'Miembros del Equipo',
  addMember: 'Añadir Miembro',
  removeMember: 'Eliminar Miembro',
  role: 'Rol',
  
  // AI Features
  miraAI: 'Mira IA',
  
  // Outreach
  outreach: 'Difusión',
};

// Get language from local storage or use default
export const getCurrentLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('APP_LANGUAGE') as Language;
    if (storedLang && ['en', 'de', 'fr', 'es'].includes(storedLang)) {
      return storedLang;
    }
  }
  return 'en';
};

// Get translation for a key in the current language
export const getTranslation = (language: Language, key: keyof TranslationDict): string => {
  const translations: Record<Language, TranslationDict> = { en, de, fr, es };
  return translations[language][key] || translations['en'][key];
};

const LanguageSettings = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(getCurrentLanguage());
  const { toast } = useToast();

  // Save language preference
  const handleSaveLanguage = () => {
    localStorage.setItem('APP_LANGUAGE', selectedLanguage);
    
    // Dispatch custom event to notify other components
    const event = new CustomEvent('app-language-change', { 
      detail: { language: selectedLanguage } 
    });
    window.dispatchEvent(event);
    
    toast({
      title: "Language settings saved",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Language Settings</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred language for the application interface.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Language
            </label>
            <select 
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value as Language)}
              className="w-full p-2 border rounded-md"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={handleSaveLanguage}>
            Save
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedLanguage(getCurrentLanguage())}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
