
import React from 'react';
import { ProfilePage } from '../../Settings/ProfilePage';
import { useAuth } from '../../../context/auth';

const Profile = () => {
  const { user } = useAuth();
  
  // Determine base path based on user role
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();

  return <ProfilePage basePath={basePath} settingsType="profile" />;
};

export default Profile;
