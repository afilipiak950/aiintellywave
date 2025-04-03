
import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import { useAuth } from '@/context/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Account = () => {
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
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page is currently under development. Account settings will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default Account;
