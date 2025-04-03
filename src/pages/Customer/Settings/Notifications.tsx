
import React from 'react';
import SettingsLayout from '../../../components/settings/SettingsLayout';
import { useAuth } from '../../../context/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Notifications = () => {
  const { user } = useAuth();
  
  // Determine base path based on user role
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();

  return (
    <SettingsLayout basePath={basePath}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">All Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Enable or disable all email notifications</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-projects">Project Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about changes to your projects</p>
              </div>
              <Switch id="email-projects" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">All Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Enable or disable all push notifications</p>
              </div>
              <Switch id="push-notifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-messages">Messages</Label>
                <p className="text-sm text-muted-foreground">Get notified about new messages</p>
              </div>
              <Switch id="push-messages" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default Notifications;
