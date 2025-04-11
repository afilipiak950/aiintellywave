
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './navigation/constants';
import { useTranslation } from '../../hooks/useTranslation';
import { SidebarHeader } from './sidebar/SidebarHeader';
import SidebarNav from './sidebar/SidebarNav';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { getNavItemsForRole } from './navigation/utils';
import { NavItem } from './navigation/types';
import { cn } from '@/lib/utils';

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

  // Set active state based on current path
  const navItemsWithActiveState = navItems.map(item => {
    // Extract the base path from the current location
    const currentBasePath = location.pathname.split('/').slice(0, 3).join('/');
    
    // Extract the base path from the item's href
    const itemBasePath = item.href.split('/').slice(0, 3).join('/');
    
    // Special case for settings subpaths
    const isSettingsActive = 
      item.href.includes('/settings') && location.pathname.includes('/settings');
    
    return {
      ...item,
      active: currentBasePath === itemBasePath || isSettingsActive
    };
  });

  // Map NavItem to the expected format for SidebarNav
  const mappedNavItems = navItemsWithActiveState.map(item => ({
    href: item.path || item.href || '#',
    label: item.name,
    icon: item.icon,
    active: item.active
  }));

  // Log current path for debugging
  useEffect(() => {
    console.info('[SidebarNav] Path changed to:', location.pathname);
  }, [location.pathname]);

  return (
    <aside 
      className={cn(
        "bg-sidebar h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-20",
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <SidebarHeader 
            role={role} 
            collapsed={collapsed} 
            toggleSidebar={toggleSidebar} 
          />
          
          <div className="flex-grow overflow-y-auto py-4">
            <SidebarNav 
              links={mappedNavItems} 
              collapsed={collapsed} 
            />
          </div>
        </div>
        
        <SidebarFooter 
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
