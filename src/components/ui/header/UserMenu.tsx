
import { useState, useRef } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/auth';
import { Link } from 'react-router-dom';
import { useOnClickOutside } from '../../../hooks/use-click-outside';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(menuRef, () => setShowUserMenu(false));
  
  // Get the correct base path based on user role
  const getBasePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/customer';
  };
  
  const basePath = getBasePath();
  
  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };
  
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => setShowUserMenu(!showUserMenu)}
        aria-label="User menu"
      >
        <Avatar className="h-8 w-8 ring-2 ring-gray-200">
          {user?.avatar ? (
            <AvatarImage src={user.avatar} alt="Profile" />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="hidden md:block text-sm text-left">
          <p className="font-medium">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user?.email || 'User'}
          </p>
          <p className="text-xs text-gray-500 capitalize">{user?.role || 'Guest'}</p>
        </div>
      </button>
      
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100]">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <Link 
              to={`${basePath}/profile`} 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
              role="menuitem"
              onClick={() => setShowUserMenu(false)}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <Link 
              to={`${basePath}/settings/notifications`} 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
              role="menuitem"
              onClick={() => setShowUserMenu(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            <div className="border-t border-gray-100 my-1"></div>
            <button 
              onClick={handleLogout} 
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
              role="menuitem"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
