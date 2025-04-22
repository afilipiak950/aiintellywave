
import React from 'react';
import SettingsLayout from '../../components/settings/SettingsLayout';

const ManagerSettings: React.FC = () => {
  return (
    <SettingsLayout basePath="/manager">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-4">Manager Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Account Information</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This page will allow managers to configure their account settings.
            </p>
            
            <div className="flex flex-col gap-2 text-sm">
              <div>
                <span className="font-medium">Role:</span> Manager
              </div>
              <div>
                <span className="font-medium">Last Login:</span> {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ManagerSettings;
