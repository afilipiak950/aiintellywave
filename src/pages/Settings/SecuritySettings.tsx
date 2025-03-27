
import { useState } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { useAuth } from '../../context/auth';
import { supabase } from '../../integrations/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { toast } from '../../hooks/use-toast';
import { AlertCircle, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { getCurrentLanguage, getTranslation, type TranslationDict } from '../Settings/LanguageSettings';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const SecuritySettings = () => {
  const { user, signOut } = useAuth();
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeSessions, setActiveSessions] = useState<{id: string, created_at: string, last_active: string, device: string}[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const currentLanguage = getCurrentLanguage();
  
  // Function to translate based on current language
  const t = (key: keyof TranslationDict): string => getTranslation(currentLanguage, key);
  
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const onSubmitPasswordChange = async (values: PasswordFormValues) => {
    if (!user?.email) {
      toast({
        title: t('errorTitle'),
        description: t('emailUnavailable'),
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      });
      
      if (signInError) {
        toast({
          title: t('incorrectPassword'),
          description: t('currentPasswordIncorrect'),
          variant: "destructive",
        });
        setIsChangingPassword(false);
        return;
      }
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (updateError) throw updateError;
      
      toast({
        title: t('passwordUpdated'),
        description: t('passwordChangeSuccess'),
      });
      
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: t('errorTitle'),
        description: error.message || t('passwordUpdateFailed'),
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleToggleTwoFactor = async () => {
    setIsTwoFactorEnabled(!isTwoFactorEnabled);
    
    toast({
      title: !isTwoFactorEnabled ? t('twoFactorEnabled') : t('twoFactorDisabled'),
      description: !isTwoFactorEnabled 
        ? t('twoFactorEnabledDesc') 
        : t('twoFactorDisabledDesc'),
    });
  };
  
  const handleShowSessions = async () => {
    if (showSessions) {
      setShowSessions(false);
      return;
    }
    
    setIsLoadingSessions(true);
    setShowSessions(true);
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        const formattedSessions = [{
          id: data.session.access_token || 'current-session',
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
          device: t('currentDevice')
        }];
        
        setActiveSessions(formattedSessions);
      } else {
        setActiveSessions([]);
      }
    } catch (error: any) {
      console.error('Error fetching session:', error);
      toast({
        title: t('errorTitle'),
        description: t('sessionLoadFailed'),
        variant: "destructive",
      });
      
      setActiveSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };
  
  const handleLogoutSession = async (sessionId: string) => {
    try {
      await supabase.auth.signOut({ scope: 'others' });
      
      const currentSession = activeSessions.find(s => s.id === sessionId);
      setActiveSessions(currentSession ? [currentSession] : []);
      
      toast({
        title: t('sessionsTerminated'),
        description: t('otherSessionsLoggedOut'),
      });
    } catch (error: any) {
      toast({
        title: t('errorTitle'),
        description: error.message || t('logoutSessionFailed'),
        variant: "destructive",
      });
    }
  };
  
  const handleLogoutAllSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: t('allSessionsLoggedOut'),
        description: t('loggedOutAllDevices'),
      });
      
      signOut();
    } catch (error: any) {
      toast({
        title: t('errorTitle'),
        description: error.message || t('logoutAllSessionsFailed'),
        variant: "destructive",
      });
    }
  };

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('securitySettings')}</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('changePassword')}</CardTitle>
              <CardDescription>{t('updateAccountPassword')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('currentPassword')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('newPassword')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('confirmNewPassword')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {t('changingPassword')}
                      </>
                    ) : t('changePassword')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('twoFactorAuthentication')}</CardTitle>
              <CardDescription>{t('addExtraSecurity')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('note')}</AlertTitle>
                <AlertDescription>
                  {t('twoFactorSimulated')}
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('twoFactorAuth')}</p>
                  <p className="text-sm text-gray-500">
                    {isTwoFactorEnabled 
                      ? t('accountProtected') 
                      : t('protectAccount')}
                  </p>
                </div>
                <Switch
                  checked={isTwoFactorEnabled}
                  onCheckedChange={handleToggleTwoFactor}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('activeSessions')}</CardTitle>
              <CardDescription>{t('manageLoggedDevices')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleShowSessions}
                  disabled={isLoadingSessions}
                >
                  {isLoadingSessions ? (
                    <>
                      <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>
                      {t('loadingSessions')}
                    </>
                  ) : showSessions ? t('hideSessions') : t('showActiveSessions')}
                </Button>
                
                {showSessions && (
                  <div className="space-y-4">
                    {isLoadingSessions ? (
                      <div className="flex justify-center p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : activeSessions.length > 0 ? (
                      <div className="rounded-md border">
                        <div className="p-4 space-y-4">
                          {activeSessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                              <div>
                                <p className="font-medium">{session.device}</p>
                                <p className="text-sm text-gray-500">
                                  {t('active')} {new Date(session.last_active).toLocaleString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLogoutSession(session.id)}
                              >
                                {t('logout')}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-gray-500">{t('noActiveSessions')}</p>
                      </div>
                    )}
                    
                    {activeSessions.length > 0 && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLogoutAllSessions}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('logoutAllSessions')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default SecuritySettings;
