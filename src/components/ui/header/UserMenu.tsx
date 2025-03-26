
import { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const UserMenu = () => {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="relative">
      <button 
        className="flex items-center space-x-3"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <div className="overflow-hidden rounded-full h-8 w-8 ring-2 ring-gray-200">
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <User className="h-full w-full p-1 text-gray-400" />
          )}
        </div>
        <div className="hidden md:block text-sm text-left">
          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </button>
      
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 animate-scale-in">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Your Profile</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Logout</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
