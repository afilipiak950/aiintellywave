
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  role: 'admin' | 'manager' | 'customer';
  collapsed: boolean;
  toggleSidebar: () => void;
}

export const SidebarHeader = ({ role, collapsed, toggleSidebar }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
      <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
        {!collapsed ? (
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/6d77ec61-2607-4e14-955c-1778591c9b4e.png" 
              alt="Logo" 
              className="h-8 object-contain" 
            />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/6d77ec61-2607-4e14-955c-1778591c9b4e.png" 
              alt="Logo" 
              className="h-6 object-contain" 
            />
          </div>
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
