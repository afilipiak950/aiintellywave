
import { ProfilePage } from '../Settings/ProfilePage';
import { useAuth } from '../../context/auth';
import { useLocation } from 'react-router-dom';

const CustomerSettings = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Determine settings type based on path
  const getSettingsType = () => {
    const path = location.pathname;
    if (path.includes('/settings/security')) return 'security';
    if (path.includes('/settings/language')) return 'language';
    return 'profile';
  };
  
  // Determine base path based on user role
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();
  const settingsType = getSettingsType();
  
  return <ProfilePage basePath={basePath} settingsType={settingsType} />;
};

export default CustomerSettings;
