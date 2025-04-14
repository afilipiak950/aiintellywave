
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
import { supabase } from '@/integrations/supabase/client';

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
  const [navItemsState, setNavItemsState] = useState<NavItem[]>([]);
  const [isNavLoading, setIsNavLoading] = useState(true);
  const [featureUpdateCount, setFeatureUpdateCount] = useState(0); // Counter to force rerenders

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Subscribe to feature updates
  useEffect(() => {
    if (role === 'customer') {
      console.log('[Sidebar] Setting up feature updates subscription');
      
      const channel = supabase
        .channel('sidebar-feature-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'company_features' 
          }, 
          (payload) => {
            console.log('[Sidebar] Detected change in company_features:', payload);
            setFeatureUpdateCount(prev => prev + 1); // Force rerender
          }
        )
        .subscribe();
        
      return () => {
        console.log('[Sidebar] Cleaning up feature updates subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [role]);

  // Get navigation items based on role
  useEffect(() => {
    setIsNavLoading(true);
    
    let items: NavItem[] = [];
    if (role === 'customer') {
      items = customerNavItems;
      console.log('[Sidebar] Setting customer nav items:', items.map(i => i.name));
    } else if (role === 'admin') {
      items = ADMIN_NAV_ITEMS;
    } else {
      items = MANAGER_NAV_ITEMS;
    }
    
    // Set active state based on current path
    const itemsWithActiveState = items.map(item => {
      const active = isActive(item.href);
      
      // Debug log for the Jobangebote item
      if (item.href === '/customer/job-parsing') {
        console.log('[Sidebar] Jobangebote item is present in sidebar with active state:', active);
      }
      
      return {
        ...item,
        active
      };
    });
    
    setNavItemsState(itemsWithActiveState);
    setIsNavLoading(false);
  }, [customerNavItems, role, location.pathname, isActive, featureUpdateCount]);

  // Log current path for debugging
  useEffect(() => {
    console.log('[SidebarNav] Path changed to:', location.pathname);
    
    // Check if Jobangebote is in the menu
    const hasJobangebote = navItemsState.some(i => i.href === '/customer/job-parsing');
    console.log('[SidebarNav] Jobangebote visible in menu:', hasJobangebote);
    
    // For customer role, log all menu items
    if (role === 'customer') {
      console.log('[SidebarNav] Customer menu items:', 
        navItemsState.map(i => ({ name: i.name, href: i.href }))
      );
    }
  }, [location.pathname, navItemsState, role]);

  // Transform nav items to match SidebarNav props format
  const sidebarNavItems = navItemsState.map(item => ({
    href: item.href,
    label: item.name,
    icon: item.icon,
    active: item.active,
    badge: item.badge
  }));

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
              isLoading={isNavLoading}
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
