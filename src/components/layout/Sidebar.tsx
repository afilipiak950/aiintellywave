
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './navigation/constants';
import { useTranslation } from '../../hooks/useTranslation';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNav } from './sidebar/SidebarNav';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { getNavItemsForRole } from './navigation/utils';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
}

const Sidebar = ({ role }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { translationDict, t } = useTranslation();
  const location = useLocation();

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Get navigation items based on role
  const navItems = getNavItemsForRole(role, NAV_ITEMS);

  // Log current path for debugging
  useEffect(() => {
    console.info('[SidebarNav] Path changed to:', location.pathname);
  }, [location.pathname]);

  return (
    <aside 
      className={`bg-sidebar h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <SidebarHeader 
        role={role} 
        collapsed={collapsed} 
        toggleSidebar={toggleSidebar} 
      />
      
      <SidebarNav 
        navItems={navItems} 
        collapsed={collapsed} 
      />
      
      <SidebarFooter 
        collapsed={collapsed}
      />
    </aside>
  );
};

export default Sidebar;
