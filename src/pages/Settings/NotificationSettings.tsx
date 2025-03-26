
import { useState, useEffect } from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { useAuth } from '../../context/auth';
import { useUserSettings } from '../../hooks/use-user-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Button } from '../../components/ui/button';

const NotificationSettings = () => {
  const { user } = useAuth();
  const { settings, updateSettings, loading } = useUserSettings();
  const [formState, setFormState] = useState({
    email_notifications: true,
    push_notifications: true
  });
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
      setFormState({
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications
      });
    }
  }, [settings, loading]);

  const handleSwitchChange = (field: keyof typeof formState) => {
    setFormState(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    await updateSettings({
      email_notifications: formState.email_notifications,
      push_notifications: formState.push_notifications
    });
    
    setIsSaving(false);
  };

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure when you'll receive email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-project-updates">Project Updates</Label>
                    <p className="text-sm text-gray-500">Receive emails about project status changes</p>
                  </div>
                  <Switch 
                    id="email-project-updates"
                    checked={formState.email_notifications}
                    onCheckedChange={() => handleSwitchChange('email_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-team-mentions">Team Mentions</Label>
                    <p className="text-sm text-gray-500">Receive emails when you're mentioned in comments</p>
                  </div>
                  <Switch 
                    id="email-team-mentions"
                    checked={formState.email_notifications}
                    onCheckedChange={() => handleSwitchChange('email_notifications')}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Configure in-app notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-all">All Notifications</Label>
                    <p className="text-sm text-gray-500">Enable or disable all push notifications</p>
                  </div>
                  <Switch 
                    id="push-all"
                    checked={formState.push_notifications}
                    onCheckedChange={() => handleSwitchChange('push_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-comments">Comments & Replies</Label>
                    <p className="text-sm text-gray-500">Get notified about new comments and replies</p>
                  </div>
                  <Switch 
                    id="push-comments"
                    checked={formState.push_notifications}
                    onCheckedChange={() => handleSwitchChange('push_notifications')}
                    disabled={!formState.push_notifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-tasks">Task Assignments</Label>
                    <p className="text-sm text-gray-500">Get notified when you're assigned to a task</p>
                  </div>
                  <Switch 
                    id="push-tasks"
                    checked={formState.push_notifications}
                    onCheckedChange={() => handleSwitchChange('push_notifications')}
                    disabled={!formState.push_notifications}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Saving
                  </>
                ) : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </SettingsLayout>
  );
};

export default NotificationSettings;
