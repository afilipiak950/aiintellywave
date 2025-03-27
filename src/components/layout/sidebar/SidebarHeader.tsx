
import { Menu, X } from 'lucide-react';

interface SidebarHeaderProps {
  role: 'admin' | 'manager' | 'customer';
  collapsed: boolean;
  toggleSidebar: () => void;
}

export const SidebarHeader = ({ role, collapsed, toggleSidebar }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
      <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
        {!collapsed && (
          <span className="text-xl font-bold text-white ml-2">
            {role === 'admin' ? 'Admin Portal' : 
             role === 'manager' ? 'Manager Portal' : 
             'Customer Portal'}
          </span>
        )}
        {collapsed && (
          <span className="text-xl font-bold text-white">
            {role === 'admin' ? 'A' : 
             role === 'manager' ? 'M' : 
             'C'}
          </span>
        )}
      </div>
      <button 
        onClick={toggleSidebar} 
        className="text-sidebar-foreground hover:text-white transition-colors p-1"
      >
        {collapsed ? <Menu size={20} /> : <X size={20} />}
      </button>
    </div>
  );
};
