
import React, { useState } from 'react';
import SidebarNav from './sidebar/SidebarNav';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarFooter from './sidebar/SidebarFooter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useLocation } from 'react-router-dom';
import { useNavActiveState } from '@/hooks/use-nav-active-state';
import { getNavItems } from './SidebarNavItems';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
  collapsed?: boolean;
  onStateChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ role, collapsed = false, onStateChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { getActiveState } = useNavActiveState(location.pathname);
  
  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onStateChange) {
      onStateChange(newCollapsedState);
    }
  };
  
  // Effect to sync collapsed state from props
  React.useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const navItems = getNavItems(role, getActiveState);

  return (
    <aside 
      className={`fixed top-0 left-0 h-full bg-blue-900 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <SidebarHeader collapsed={isCollapsed} />
        
        <button 
          className="absolute right-0 top-4 transform translate-x-1/2 bg-blue-700 p-1 rounded-full hover:bg-blue-600 transition-colors"
          onClick={toggleSidebar}
        >
          {isCollapsed ? 
            <ChevronRight className="h-4 w-4 text-white" /> : 
            <ChevronLeft className="h-4 w-4 text-white" />
          }
        </button>
        
        <div className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">
          <SidebarNav links={navItems} collapsed={isCollapsed} isLoading={isLoading} />
        </div>
        
        <SidebarFooter collapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
