
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SettingsLayout from '@/components/settings/SettingsLayout';

const ManagerSettings = () => {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Manager Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Manage your account settings and preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default ManagerSettings;
