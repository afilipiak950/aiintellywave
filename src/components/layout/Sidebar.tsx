
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_NAV_ITEMS, MANAGER_NAV_ITEMS, useCustomerNavItems } from './SidebarNavItems';
import { useTranslation } from '../../hooks/useTranslation';
import { SidebarHeader } from './sidebar/SidebarHeader';
import SidebarNav from './sidebar/SidebarNav';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { getNavItemsForRole } from './navigation/utils';
import { NavItem } from './navigation/types';
import { cn } from '@/lib/utils';
import { useNavActiveState } from '@/hooks/use-nav-active-state';
import { toast } from '@/hooks/use-toast';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
}

const Sidebar = ({ role }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { translationDict, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isActive } = useNavActiveState();
  const customerNavItems = useCustomerNavItems();

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Get navigation items based on role
  const getNavItems = () => {
    if (role === 'customer') {
      return customerNavItems;
    } else if (role === 'admin') {
      return ADMIN_NAV_ITEMS;
    } else {
      return MANAGER_NAV_ITEMS;
    }
  };
  
  const navItems = getNavItems();

  // Set active state based on current path
  const navItemsWithActiveState = navItems.map(item => {
    const active = isActive(item.href);
    
    // Log when the jobangebote item is active/visible
    if (item.href === '/customer/job-parsing') {
      console.log('Jobangebote item is present in sidebar with active state:', active);
    }
    
    return {
      ...item,
      active
    };
  });

  // Transform nav items to match SidebarNav props format
  const sidebarNavItems = navItemsWithActiveState.map(item => ({
    href: item.href,
    label: item.name,
    icon: item.icon,
    active: item.active,
    badge: item.badge
  }));

  // Log current path for debugging
  useEffect(() => {
    console.info('[SidebarNav] Path changed to:', location.pathname);
    console.info('[SidebarNav] Nav items:', navItemsWithActiveState.map(i => ({ name: i.name, href: i.href })));
    
    // Check if Jobangebote is in the menu
    const hasJobangebote = navItemsWithActiveState.some(i => i.href === '/customer/job-parsing');
    console.log('[SidebarNav] Jobangebote visible in menu:', hasJobangebote);
  }, [location.pathname, navItemsWithActiveState]);

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
              links={sidebarNavItems} 
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
