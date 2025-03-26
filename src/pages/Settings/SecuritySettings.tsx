
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
  const [sessionsList, setSessionsList] = useState<{id: string, created_at: string, last_active: string, device: string}[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  
  // Determine base path based on user role
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
    if (!user?.email) return;
    
    setIsChangingPassword(true);
    
    try {
      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      });
      
      if (signInError) {
        toast({
          title: "Incorrect password",
          description: "Your current password is incorrect",
          variant: "destructive",
        });
        return;
      }
      
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (updateError) throw updateError;
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleToggleTwoFactor = async () => {
    // This is a mock implementation
    // In a real application, you would implement actual 2FA setup flow
    setIsTwoFactorEnabled(!isTwoFactorEnabled);
    
    toast({
      title: !isTwoFactorEnabled ? "2FA Enabled" : "2FA Disabled",
      description: !isTwoFactorEnabled 
        ? "Two-factor authentication has been enabled" 
        : "Two-factor authentication has been disabled",
    });
  };
  
  const handleShowSessions = async () => {
    // Mock implementation - in a real app, you'd fetch this from your backend
    if (showSessions) {
      setShowSessions(false);
      return;
    }
    
    // Generate some mock sessions data
    setSessionsList([
      {
        id: '1',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        device: 'Chrome on Windows'
      },
      {
        id: '2',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        last_active: new Date(Date.now() - 1800000).toISOString(),
        device: 'Safari on iPhone'
      }
    ]);
    
    setShowSessions(true);
  };
  
  const handleLogoutSession = (sessionId: string) => {
    // Mock implementation
    setSessionsList(sessionsList.filter(s => s.id !== sessionId));
    
    toast({
      title: "Session terminated",
      description: "The selected session has been logged out",
    });
  };
  
  const handleLogoutAllSessions = async () => {
    try {
      // In a real app, you'd call a backend endpoint to invalidate all sessions
      // For Supabase, you can use the signOut method with the scope option
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "All sessions logged out",
        description: "You've been logged out from all devices",
      });
      
      // Redirect to login page
      signOut();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out all sessions",
        variant: "destructive",
      });
    }
  };

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Security Settings</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
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
                        <FormLabel>New Password</FormLabel>
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
                        <FormLabel>Confirm New Password</FormLabel>
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
                        Changing Password
                      </>
                    ) : 'Change Password'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  Two-factor authentication is simulated in this demo. In a production environment, you would implement a complete 2FA flow.
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication (2FA)</p>
                  <p className="text-sm text-gray-500">
                    {isTwoFactorEnabled 
                      ? "Your account is protected with 2FA" 
                      : "Protect your account with 2FA"}
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
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your logged-in devices and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleShowSessions}
                >
                  {showSessions ? 'Hide Sessions' : 'Show Active Sessions'}
                </Button>
                
                {showSessions && (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <div className="p-4 space-y-4">
                        {sessionsList.map((session) => (
                          <div key={session.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="font-medium">{session.device}</p>
                              <p className="text-sm text-gray-500">
                                Active {new Date(session.last_active).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLogoutSession(session.id)}
                            >
                              Logout
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleLogoutAllSessions}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout All Sessions
                    </Button>
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
