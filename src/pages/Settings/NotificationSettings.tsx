
import { useState, useEffect } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { useAuth } from '../../context/auth';
import { useUserSettings } from '../../hooks/use-user-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/use-toast';
import { getCurrentLanguage, getTranslation, TranslationDict } from './LanguageSettings';

// Add translations for notification settings
const notificationTranslations = {
  en: {
    notificationSettings: 'Notification Settings',
    emailNotifications: 'Email Notifications',
    configureEmail: 'Configure when you\'ll receive email notifications',
    projectUpdates: 'Project Updates',
    projectUpdatesDesc: 'Receive emails about project status changes',
    teamMentions: 'Team Mentions',
    teamMentionsDesc: 'Receive emails when you\'re mentioned in comments',
    pushNotifications: 'Push Notifications',
    configurePush: 'Configure in-app notification preferences',
    allNotifications: 'All Notifications',
    allNotificationsDesc: 'Enable or disable all push notifications',
    commentsReplies: 'Comments & Replies',
    commentsRepliesDesc: 'Get notified about new comments and replies',
    taskAssignments: 'Task Assignments',
    taskAssignmentsDesc: 'Get notified when you\'re assigned to a task',
    saveChanges: 'Save Changes',
    saving: 'Saving',
    successTitle: 'Settings updated',
    successMessage: 'Your notification preferences have been updated',
  },
  de: {
    notificationSettings: 'Benachrichtigungseinstellungen',
    emailNotifications: 'E-Mail-Benachrichtigungen',
    configureEmail: 'Konfigurieren Sie, wann Sie E-Mail-Benachrichtigungen erhalten',
    projectUpdates: 'Projekt-Updates',
    projectUpdatesDesc: 'Erhalten Sie E-Mails über Projektstatusänderungen',
    teamMentions: 'Team-Erwähnungen',
    teamMentionsDesc: 'Erhalten Sie E-Mails, wenn Sie in Kommentaren erwähnt werden',
    pushNotifications: 'Push-Benachrichtigungen',
    configurePush: 'Konfigurieren Sie In-App-Benachrichtigungseinstellungen',
    allNotifications: 'Alle Benachrichtigungen',
    allNotificationsDesc: 'Aktivieren oder deaktivieren Sie alle Push-Benachrichtigungen',
    commentsReplies: 'Kommentare & Antworten',
    commentsRepliesDesc: 'Werden Sie über neue Kommentare und Antworten benachrichtigt',
    taskAssignments: 'Aufgabenzuweisungen',
    taskAssignmentsDesc: 'Werden Sie benachrichtigt, wenn Ihnen eine Aufgabe zugewiesen wird',
    saveChanges: 'Änderungen speichern',
    saving: 'Speichern',
    successTitle: 'Einstellungen aktualisiert',
    successMessage: 'Ihre Benachrichtigungseinstellungen wurden aktualisiert',
  },
  fr: {
    notificationSettings: 'Paramètres de notification',
    emailNotifications: 'Notifications par e-mail',
    configureEmail: 'Configurez quand vous recevrez des notifications par e-mail',
    projectUpdates: 'Mises à jour de projet',
    projectUpdatesDesc: 'Recevez des e-mails sur les changements de statut du projet',
    teamMentions: 'Mentions d\'équipe',
    teamMentionsDesc: 'Recevez des e-mails lorsque vous êtes mentionné dans des commentaires',
    pushNotifications: 'Notifications push',
    configurePush: 'Configurez les préférences de notification dans l\'application',
    allNotifications: 'Toutes les notifications',
    allNotificationsDesc: 'Activer ou désactiver toutes les notifications push',
    commentsReplies: 'Commentaires et réponses',
    commentsRepliesDesc: 'Soyez notifié des nouveaux commentaires et réponses',
    taskAssignments: 'Attributions de tâches',
    taskAssignmentsDesc: 'Soyez notifié lorsqu\'une tâche vous est attribuée',
    saveChanges: 'Enregistrer les modifications',
    saving: 'Enregistrement',
    successTitle: 'Paramètres mis à jour',
    successMessage: 'Vos préférences de notification ont été mises à jour',
  },
  es: {
    notificationSettings: 'Configuración de notificaciones',
    emailNotifications: 'Notificaciones por correo electrónico',
    configureEmail: 'Configure cuándo recibirá notificaciones por correo electrónico',
    projectUpdates: 'Actualizaciones de proyecto',
    projectUpdatesDesc: 'Reciba correos electrónicos sobre cambios de estado del proyecto',
    teamMentions: 'Menciones de equipo',
    teamMentionsDesc: 'Reciba correos electrónicos cuando se le mencione en comentarios',
    pushNotifications: 'Notificaciones push',
    configurePush: 'Configure las preferencias de notificaciones en la aplicación',
    allNotifications: 'Todas las notificaciones',
    allNotificationsDesc: 'Habilitar o deshabilitar todas las notificaciones push',
    commentsReplies: 'Comentarios y respuestas',
    commentsRepliesDesc: 'Reciba notificaciones sobre nuevos comentarios y respuestas',
    taskAssignments: 'Asignaciones de tareas',
    taskAssignmentsDesc: 'Reciba notificaciones cuando se le asigne una tarea',
    saveChanges: 'Guardar cambios',
    saving: 'Guardando',
    successTitle: 'Configuración actualizada',
    successMessage: 'Sus preferencias de notificación han sido actualizadas',
  },
};

// Type for notification translations
type NotificationTranslations = typeof notificationTranslations.en;

// Get notification translation
const getNotificationTranslation = (lang: string, key: keyof NotificationTranslations): string => {
  const language = lang as keyof typeof notificationTranslations;
  return notificationTranslations[language]?.[key] || notificationTranslations.en[key];
};

const NotificationSettings = () => {
  const { user } = useAuth();
  const { settings, updateSettings, loading } = useUserSettings();
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  
  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [teamMentions, setTeamMentions] = useState(true);
  const [commentsNotifications, setCommentsNotifications] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine base path based on user role
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();
  
  // Translation helper
  const t = (key: keyof NotificationTranslations): string => 
    getNotificationTranslation(currentLanguage, key);
  
  // Initialize settings
  useEffect(() => {
    if (!loading && settings) {
      setEmailNotifications(settings.email_notifications);
      setPushNotifications(settings.push_notifications);
      // Set the granular settings based on the main settings
      setProjectUpdates(settings.email_notifications);
      setTeamMentions(settings.email_notifications);
      setCommentsNotifications(settings.push_notifications);
      setTaskNotifications(settings.push_notifications);
    }
    
    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };
    
    window.addEventListener('app-language-change', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('app-language-change', handleLanguageChange as EventListener);
    };
  }, [settings, loading]);

  // Handle email notifications toggle
  const handleEmailToggle = () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    // When main email is toggled, also toggle granular settings
    setProjectUpdates(newValue);
    setTeamMentions(newValue);
  };
  
  // Handle push notifications toggle
  const handlePushToggle = () => {
    const newValue = !pushNotifications;
    setPushNotifications(newValue);
    // When main push is toggled, also toggle granular settings
    setCommentsNotifications(newValue);
    setTaskNotifications(newValue);
  };
  
  // Handle granular email notification toggles
  const handleProjectUpdatesToggle = () => {
    setProjectUpdates(!projectUpdates);
    // If both granular settings are turned off, also turn off main setting
    if (projectUpdates && !teamMentions) {
      setEmailNotifications(false);
    }
    // If any granular setting is turned on, also turn on main setting
    else if (!projectUpdates && !teamMentions) {
      setEmailNotifications(true);
    }
  };
  
  const handleTeamMentionsToggle = () => {
    setTeamMentions(!teamMentions);
    // If both granular settings are turned off, also turn off main setting
    if (!projectUpdates && teamMentions) {
      setEmailNotifications(false);
    }
    // If any granular setting is turned on, also turn on main setting
    else if (!projectUpdates && !teamMentions) {
      setEmailNotifications(true);
    }
  };
  
  // Handle granular push notification toggles
  const handleCommentsToggle = () => {
    setCommentsNotifications(!commentsNotifications);
    // Update main push setting based on granular settings
    if (commentsNotifications && !taskNotifications) {
      setPushNotifications(false);
    } else if (!commentsNotifications && !taskNotifications) {
      setPushNotifications(true);
    }
  };
  
  const handleTasksToggle = () => {
    setTaskNotifications(!taskNotifications);
    // Update main push setting based on granular settings
    if (!commentsNotifications && taskNotifications) {
      setPushNotifications(false);
    } else if (!commentsNotifications && !taskNotifications) {
      setPushNotifications(true);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Update settings in Supabase
      await updateSettings({
        email_notifications: emailNotifications,
        push_notifications: pushNotifications
      });
      
      toast({
        title: t('successTitle'),
        description: t('successMessage')
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('notificationSettings')}</h1>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('emailNotifications')}</CardTitle>
                <CardDescription>{t('configureEmail')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-all">All Email Notifications</Label>
                    <p className="text-sm text-gray-500">Enable or disable all email notifications</p>
                  </div>
                  <Switch 
                    id="email-all"
                    checked={emailNotifications}
                    onCheckedChange={handleEmailToggle}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-project-updates">{t('projectUpdates')}</Label>
                    <p className="text-sm text-gray-500">{t('projectUpdatesDesc')}</p>
                  </div>
                  <Switch 
                    id="email-project-updates"
                    checked={projectUpdates}
                    onCheckedChange={handleProjectUpdatesToggle}
                    disabled={!emailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-team-mentions">{t('teamMentions')}</Label>
                    <p className="text-sm text-gray-500">{t('teamMentionsDesc')}</p>
                  </div>
                  <Switch 
                    id="email-team-mentions"
                    checked={teamMentions}
                    onCheckedChange={handleTeamMentionsToggle}
                    disabled={!emailNotifications}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('pushNotifications')}</CardTitle>
                <CardDescription>{t('configurePush')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-all">{t('allNotifications')}</Label>
                    <p className="text-sm text-gray-500">{t('allNotificationsDesc')}</p>
                  </div>
                  <Switch 
                    id="push-all"
                    checked={pushNotifications}
                    onCheckedChange={handlePushToggle}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-comments">{t('commentsReplies')}</Label>
                    <p className="text-sm text-gray-500">{t('commentsRepliesDesc')}</p>
                  </div>
                  <Switch 
                    id="push-comments"
                    checked={commentsNotifications}
                    onCheckedChange={handleCommentsToggle}
                    disabled={!pushNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-tasks">{t('taskAssignments')}</Label>
                    <p className="text-sm text-gray-500">{t('taskAssignmentsDesc')}</p>
                  </div>
                  <Switch 
                    id="push-tasks"
                    checked={taskNotifications}
                    onCheckedChange={handleTasksToggle}
                    disabled={!pushNotifications}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {t('saving')}
                  </>
                ) : t('saveChanges')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </SettingsLayout>
  );
};

export default NotificationSettings;
