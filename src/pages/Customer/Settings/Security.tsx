
import React from 'react';
import SecuritySettings from '../../Settings/SecuritySettings';
import SettingsLayout from '../../../components/settings/SettingsLayout';
import { useAuth } from '../../../context/auth';

const Security = () => {
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
        <h1 className="text-2xl font-bold mb-6">Security Settings</h1>
        <SecuritySettings />
      </div>
    </SettingsLayout>
  );
};

export default Security;
