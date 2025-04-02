
import { Menu, X } from 'lucide-react';

interface SidebarHeaderProps {
  role: 'admin' | 'manager' | 'customer';
  collapsed: boolean;
  toggleSidebar: () => void;
}

export const SidebarHeader = ({ role, collapsed, toggleSidebar }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center">
            <h1 className="text-white text-2xl font-bold">intellywave</h1>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <h1 className="text-white text-xl font-bold">iW</h1>
          </div>
        )}
      </div>
      <button 
        onClick={toggleSidebar} 
        className="text-white hover:text-gray-300 transition-colors p-1"
      >
        {collapsed ? <Menu size={20} /> : <X size={20} />}
      </button>
    </div>
  );
};
