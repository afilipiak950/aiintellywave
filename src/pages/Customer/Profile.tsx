
import { ProfilePage } from '../Settings/ProfilePage';
import { useAuth } from '../../context/auth';

const CustomerProfile = () => {
  const { user } = useAuth();
  
  // Determine base path based on user role
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();
  
  return <ProfilePage />;
};

export default CustomerProfile;
