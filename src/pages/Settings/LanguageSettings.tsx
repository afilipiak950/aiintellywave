
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

// Translation dictionaries for UI elements - expanded with more keys
const translations = {
  en: {
    // General
    welcome: 'Welcome back',
    overview: 'Here is an overview of your customer portal.',
    
    // Language Settings
    languageSettings: 'Language Settings',
    languagePreference: 'Language Preference',
    selectLanguage: 'Select your preferred language for the application interface',
    saveChanges: 'Save Changes',
    saving: 'Saving',
    successTitle: 'Language updated',
    successMessage: 'Your language preference has been updated',
    
    // Password and Security
    securitySettings: 'Security Settings',
    changePassword: 'Change Password',
    updateAccountPassword: 'Update your account password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    changingPassword: 'Changing Password',
    passwordUpdated: 'Password updated',
    passwordChangeSuccess: 'Your password has been changed successfully',
    incorrectPassword: 'Incorrect password',
    currentPasswordIncorrect: 'Your current password is incorrect',
    errorTitle: 'Error',
    emailUnavailable: 'Your email is not available. Please try logging in again.',
    passwordUpdateFailed: 'Failed to update password. Please try again.',
    
    // Two-Factor Authentication
    twoFactorAuthentication: 'Two-Factor Authentication',
    addExtraSecurity: 'Add an extra layer of security to your account',
    note: 'Note',
    twoFactorSimulated: 'Two-factor authentication is simulated in this demo. In a production environment, you would implement a complete 2FA flow.',
    twoFactorAuth: 'Two-Factor Authentication (2FA)',
    accountProtected: 'Your account is protected with 2FA',
    protectAccount: 'Protect your account with 2FA',
    twoFactorEnabled: '2FA Enabled',
    twoFactorDisabled: '2FA Disabled',
    twoFactorEnabledDesc: 'Two-factor authentication has been enabled',
    twoFactorDisabledDesc: 'Two-factor authentication has been disabled',
    
    // Sessions
    activeSessions: 'Active Sessions',
    manageLoggedDevices: 'Manage your logged-in devices and sessions',
    showActiveSessions: 'Show Active Sessions',
    hideSessions: 'Hide Sessions',
    loadingSessions: 'Loading Sessions...',
    currentDevice: 'Current Device',
    active: 'Active',
    logout: 'Logout',
    noActiveSessions: 'No active sessions found',
    logoutAllSessions: 'Logout All Sessions',
    sessionsTerminated: 'Sessions terminated',
    otherSessionsLoggedOut: 'All other sessions have been logged out',
    allSessionsLoggedOut: 'All sessions logged out',
    loggedOutAllDevices: 'You\'ve been logged out from all devices',
    sessionLoadFailed: 'Failed to load session data. Please try again.',
    logoutSessionFailed: 'Failed to log out session',
    logoutAllSessionsFailed: 'Failed to log out all sessions',
    
    // Dashboard
    dashboard: 'Dashboard',
    projects: 'Projects',
    appointments: 'Appointments',
    messages: 'Messages',
    miraAI: 'MIRA AI',
    settings: 'Settings',
    notifications: 'Notifications',
    security: 'Security',
    profile: 'Profile',
    language: 'Language',
    statistics: 'Statistics',
    
    // Navigation
    home: 'Home',
    logout: 'Logout',
    
    // Common Actions
    search: 'Search',
    filter: 'Filter',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
    apply: 'Apply',
    reset: 'Reset',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    
    // Notifications
    notificationSettings: 'Notification Settings',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    receiveEmails: 'Receive email notifications',
    receivePushNotifications: 'Receive push notifications',
    notificationSaved: 'Notification settings saved',
    notificationSuccess: 'Your notification preferences have been updated',
    
    // Profile
    profileSettings: 'Profile Settings',
    personalInfo: 'Personal Information',
    updateProfile: 'Update your personal information',
    displayName: 'Display Name',
    bio: 'Bio',
    profileUpdated: 'Profile updated',
    profileUpdateSuccess: 'Your profile has been updated successfully',
  },
  de: {
    // General
    welcome: 'Willkommen zurück',
    overview: 'Hier ist eine Übersicht Ihres Kundenportals.',
    
    // Language Settings
    languageSettings: 'Spracheinstellungen',
    languagePreference: 'Spracheinstellung',
    selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache für die Anwendungsoberfläche',
    saveChanges: 'Änderungen speichern',
    saving: 'Speichern',
    successTitle: 'Sprache aktualisiert',
    successMessage: 'Ihre Spracheinstellung wurde aktualisiert',
    
    // Password and Security
    securitySettings: 'Sicherheitseinstellungen',
    changePassword: 'Passwort ändern',
    updateAccountPassword: 'Aktualisieren Sie Ihr Konto-Passwort',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmNewPassword: 'Neues Passwort bestätigen',
    changingPassword: 'Passwort wird geändert',
    passwordUpdated: 'Passwort aktualisiert',
    passwordChangeSuccess: 'Ihr Passwort wurde erfolgreich geändert',
    incorrectPassword: 'Falsches Passwort',
    currentPasswordIncorrect: 'Ihr aktuelles Passwort ist falsch',
    errorTitle: 'Fehler',
    emailUnavailable: 'Ihre E-Mail ist nicht verfügbar. Bitte melden Sie sich erneut an.',
    passwordUpdateFailed: 'Passwort konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
    
    // Two-Factor Authentication
    twoFactorAuthentication: 'Zwei-Faktor-Authentifizierung',
    addExtraSecurity: 'Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu',
    note: 'Hinweis',
    twoFactorSimulated: 'Die Zwei-Faktor-Authentifizierung wird in dieser Demo simuliert. In einer Produktionsumgebung würden Sie einen vollständigen 2FA-Flow implementieren.',
    twoFactorAuth: 'Zwei-Faktor-Authentifizierung (2FA)',
    accountProtected: 'Ihr Konto ist mit 2FA geschützt',
    protectAccount: 'Schützen Sie Ihr Konto mit 2FA',
    twoFactorEnabled: '2FA aktiviert',
    twoFactorDisabled: '2FA deaktiviert',
    twoFactorEnabledDesc: 'Die Zwei-Faktor-Authentifizierung wurde aktiviert',
    twoFactorDisabledDesc: 'Die Zwei-Faktor-Authentifizierung wurde deaktiviert',
    
    // Sessions
    activeSessions: 'Aktive Sitzungen',
    manageLoggedDevices: 'Verwalten Sie Ihre angemeldeten Geräte und Sitzungen',
    showActiveSessions: 'Aktive Sitzungen anzeigen',
    hideSessions: 'Sitzungen ausblenden',
    loadingSessions: 'Sitzungen werden geladen...',
    currentDevice: 'Aktuelles Gerät',
    active: 'Aktiv',
    logout: 'Abmelden',
    noActiveSessions: 'Keine aktiven Sitzungen gefunden',
    logoutAllSessions: 'Alle Sitzungen abmelden',
    sessionsTerminated: 'Sitzungen beendet',
    otherSessionsLoggedOut: 'Alle anderen Sitzungen wurden abgemeldet',
    allSessionsLoggedOut: 'Alle Sitzungen abgemeldet',
    loggedOutAllDevices: 'Sie wurden von allen Geräten abgemeldet',
    sessionLoadFailed: 'Sitzungsdaten konnten nicht geladen werden. Bitte versuchen Sie es erneut.',
    logoutSessionFailed: 'Sitzung konnte nicht abgemeldet werden',
    logoutAllSessionsFailed: 'Alle Sitzungen konnten nicht abgemeldet werden',
    
    // Dashboard
    dashboard: 'Dashboard',
    projects: 'Projekte',
    appointments: 'Termine',
    messages: 'Nachrichten',
    miraAI: 'MIRA AI',
    settings: 'Einstellungen',
    notifications: 'Benachrichtigungen',
    security: 'Sicherheit',
    profile: 'Profil',
    language: 'Sprache',
    statistics: 'Statistiken',
    
    // Navigation
    home: 'Startseite',
    logout: 'Abmelden',
    
    // Common Actions
    search: 'Suchen',
    filter: 'Filtern',
    create: 'Erstellen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    apply: 'Anwenden',
    reset: 'Zurücksetzen',
    view: 'Ansehen',
    download: 'Herunterladen',
    upload: 'Hochladen',
    
    // Notifications
    notificationSettings: 'Benachrichtigungseinstellungen',
    emailNotifications: 'E-Mail-Benachrichtigungen',
    pushNotifications: 'Push-Benachrichtigungen',
    receiveEmails: 'E-Mail-Benachrichtigungen erhalten',
    receivePushNotifications: 'Push-Benachrichtigungen erhalten',
    notificationSaved: 'Benachrichtigungseinstellungen gespeichert',
    notificationSuccess: 'Ihre Benachrichtigungseinstellungen wurden aktualisiert',
    
    // Profile
    profileSettings: 'Profileinstellungen',
    personalInfo: 'Persönliche Informationen',
    updateProfile: 'Aktualisieren Sie Ihre persönlichen Informationen',
    displayName: 'Anzeigename',
    bio: 'Biografie',
    profileUpdated: 'Profil aktualisiert',
    profileUpdateSuccess: 'Ihr Profil wurde erfolgreich aktualisiert',
  },
  fr: {
    // General
    welcome: 'Bienvenue',
    overview: "Voici un aperçu de votre portail client.",
    
    // Language Settings
    languageSettings: 'Paramètres de langue',
    languagePreference: 'Préférence de langue',
    selectLanguage: "Sélectionnez votre langue préférée pour l'interface de l'application",
    saveChanges: 'Enregistrer les modifications',
    saving: 'Enregistrement',
    successTitle: 'Langue mise à jour',
    successMessage: 'Votre préférence linguistique a été mise à jour',
    
    // Password and Security
    securitySettings: 'Paramètres de sécurité',
    changePassword: 'Changer le mot de passe',
    updateAccountPassword: 'Mettre à jour le mot de passe de votre compte',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmNewPassword: 'Confirmer le nouveau mot de passe',
    changingPassword: 'Changement de mot de passe',
    passwordUpdated: 'Mot de passe mis à jour',
    passwordChangeSuccess: 'Votre mot de passe a été changé avec succès',
    incorrectPassword: 'Mot de passe incorrect',
    currentPasswordIncorrect: 'Votre mot de passe actuel est incorrect',
    errorTitle: 'Erreur',
    emailUnavailable: "Votre email n'est pas disponible. Veuillez vous reconnecter.",
    passwordUpdateFailed: "Échec de la mise à jour du mot de passe. Veuillez réessayer.",
    
    // Two-Factor Authentication
    twoFactorAuthentication: 'Authentification à deux facteurs',
    addExtraSecurity: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
    note: 'Note',
    twoFactorSimulated: "L'authentification à deux facteurs est simulée dans cette démo. Dans un environnement de production, vous implémenteriez un flux 2FA complet.",
    twoFactorAuth: 'Authentification à deux facteurs (2FA)',
    accountProtected: 'Votre compte est protégé avec 2FA',
    protectAccount: 'Protégez votre compte avec 2FA',
    twoFactorEnabled: '2FA activée',
    twoFactorDisabled: '2FA désactivée',
    twoFactorEnabledDesc: "L'authentification à deux facteurs a été activée",
    twoFactorDisabledDesc: "L'authentification à deux facteurs a été désactivée",
    
    // Sessions
    activeSessions: 'Sessions actives',
    manageLoggedDevices: 'Gérez vos appareils et sessions connectés',
    showActiveSessions: 'Afficher les sessions actives',
    hideSessions: 'Masquer les sessions',
    loadingSessions: 'Chargement des sessions...',
    currentDevice: 'Appareil actuel',
    active: 'Actif',
    logout: 'Déconnexion',
    noActiveSessions: 'Aucune session active trouvée',
    logoutAllSessions: 'Déconnecter toutes les sessions',
    sessionsTerminated: 'Sessions terminées',
    otherSessionsLoggedOut: 'Toutes les autres sessions ont été déconnectées',
    allSessionsLoggedOut: 'Toutes les sessions déconnectées',
    loggedOutAllDevices: 'Vous avez été déconnecté de tous les appareils',
    sessionLoadFailed: 'Échec du chargement des données de session. Veuillez réessayer.',
    logoutSessionFailed: 'Échec de la déconnexion de la session',
    logoutAllSessionsFailed: 'Échec de la déconnexion de toutes les sessions',
    
    // Dashboard
    dashboard: 'Tableau de bord',
    projects: 'Projets',
    appointments: 'Rendez-vous',
    messages: 'Messages',
    miraAI: 'MIRA AI',
    settings: 'Paramètres',
    notifications: 'Notifications',
    security: 'Sécurité',
    profile: 'Profil',
    language: 'Langue',
    statistics: 'Statistiques',
    
    // Navigation
    home: 'Accueil',
    logout: 'Déconnexion',
    
    // Common Actions
    search: 'Rechercher',
    filter: 'Filtrer',
    create: 'Créer',
    edit: 'Modifier',
    delete: 'Supprimer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    view: 'Voir',
    download: 'Télécharger',
    upload: 'Téléverser',
    
    // Notifications
    notificationSettings: 'Paramètres de notification',
    emailNotifications: 'Notifications par e-mail',
    pushNotifications: 'Notifications push',
    receiveEmails: 'Recevoir des notifications par e-mail',
    receivePushNotifications: 'Recevoir des notifications push',
    notificationSaved: 'Paramètres de notification enregistrés',
    notificationSuccess: 'Vos préférences de notification ont été mises à jour',
    
    // Profile
    profileSettings: 'Paramètres du profil',
    personalInfo: 'Informations personnelles',
    updateProfile: 'Mettre à jour vos informations personnelles',
    displayName: "Nom d'affichage",
    bio: 'Biographie',
    profileUpdated: 'Profil mis à jour',
    profileUpdateSuccess: 'Votre profil a été mis à jour avec succès',
  },
  es: {
    // General
    welcome: 'Bienvenido de nuevo',
    overview: 'Aquí hay una descripción general de su portal de cliente.',
    
    // Language Settings
    languageSettings: 'Configuración de idioma',
    languagePreference: 'Preferencia de idioma',
    selectLanguage: 'Seleccione su idioma preferido para la interfaz de la aplicación',
    saveChanges: 'Guardar cambios',
    saving: 'Guardando',
    successTitle: 'Idioma actualizado',
    successMessage: 'Su preferencia de idioma ha sido actualizada',
    
    // Password and Security
    securitySettings: 'Configuración de seguridad',
    changePassword: 'Cambiar contraseña',
    updateAccountPassword: 'Actualizar la contraseña de su cuenta',
    currentPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña',
    confirmNewPassword: 'Confirmar nueva contraseña',
    changingPassword: 'Cambiando contraseña',
    passwordUpdated: 'Contraseña actualizada',
    passwordChangeSuccess: 'Su contraseña ha sido cambiada exitosamente',
    incorrectPassword: 'Contraseña incorrecta',
    currentPasswordIncorrect: 'Su contraseña actual es incorrecta',
    errorTitle: 'Error',
    emailUnavailable: 'Su correo electrónico no está disponible. Por favor, inicie sesión nuevamente.',
    passwordUpdateFailed: 'No se pudo actualizar la contraseña. Por favor, inténtelo de nuevo.',
    
    // Two-Factor Authentication
    twoFactorAuthentication: 'Autenticación de dos factores',
    addExtraSecurity: 'Añada una capa extra de seguridad a su cuenta',
    note: 'Nota',
    twoFactorSimulated: 'La autenticación de dos factores se simula en esta demostración. En un entorno de producción, implementaría un flujo 2FA completo.',
    twoFactorAuth: 'Autenticación de dos factores (2FA)',
    accountProtected: 'Su cuenta está protegida con 2FA',
    protectAccount: 'Proteja su cuenta con 2FA',
    twoFactorEnabled: '2FA habilitado',
    twoFactorDisabled: '2FA deshabilitado',
    twoFactorEnabledDesc: 'La autenticación de dos factores ha sido habilitada',
    twoFactorDisabledDesc: 'La autenticación de dos factores ha sido deshabilitada',
    
    // Sessions
    activeSessions: 'Sesiones activas',
    manageLoggedDevices: 'Administre sus dispositivos y sesiones conectados',
    showActiveSessions: 'Mostrar sesiones activas',
    hideSessions: 'Ocultar sesiones',
    loadingSessions: 'Cargando sesiones...',
    currentDevice: 'Dispositivo actual',
    active: 'Activo',
    logout: 'Cerrar sesión',
    noActiveSessions: 'No se encontraron sesiones activas',
    logoutAllSessions: 'Cerrar todas las sesiones',
    sessionsTerminated: 'Sesiones terminadas',
    otherSessionsLoggedOut: 'Todas las otras sesiones han sido cerradas',
    allSessionsLoggedOut: 'Todas las sesiones cerradas',
    loggedOutAllDevices: 'Se ha cerrado sesión en todos los dispositivos',
    sessionLoadFailed: 'No se pudieron cargar los datos de la sesión. Por favor, inténtelo de nuevo.',
    logoutSessionFailed: 'No se pudo cerrar la sesión',
    logoutAllSessionsFailed: 'No se pudieron cerrar todas las sesiones',
    
    // Dashboard
    dashboard: 'Panel de control',
    projects: 'Proyectos',
    appointments: 'Citas',
    messages: 'Mensajes',
    miraAI: 'MIRA AI',
    settings: 'Configuración',
    notifications: 'Notificaciones',
    security: 'Seguridad',
    profile: 'Perfil',
    language: 'Idioma',
    statistics: 'Estadísticas',
    
    // Navigation
    home: 'Inicio',
    logout: 'Cerrar sesión',
    
    // Common Actions
    search: 'Buscar',
    filter: 'Filtrar',
    create: 'Crear',
    edit: 'Editar',
    delete: 'Eliminar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    apply: 'Aplicar',
    reset: 'Restablecer',
    view: 'Ver',
    download: 'Descargar',
    upload: 'Subir',
    
    // Notifications
    notificationSettings: 'Configuración de notificaciones',
    emailNotifications: 'Notificaciones por correo electrónico',
    pushNotifications: 'Notificaciones push',
    receiveEmails: 'Recibir notificaciones por correo electrónico',
    receivePushNotifications: 'Recibir notificaciones push',
    notificationSaved: 'Configuración de notificaciones guardada',
    notificationSuccess: 'Sus preferencias de notificación han sido actualizadas',
    
    // Profile
    profileSettings: 'Configuración del perfil',
    personalInfo: 'Información personal',
    updateProfile: 'Actualice su información personal',
    displayName: 'Nombre para mostrar',
    bio: 'Biografía',
    profileUpdated: 'Perfil actualizado',
    profileUpdateSuccess: 'Su perfil ha sido actualizado con éxito',
  }
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
