
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_NAV_ITEMS, MANAGER_NAV_ITEMS, useCustomerNavItems } from './SidebarNavItems';
import { useTranslation } from '../../hooks/useTranslation';
import { SidebarHeader } from './sidebar/SidebarHeader';
import SidebarNav from './sidebar/SidebarNav';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { NavItem } from './navigation/types';
import { cn } from '@/lib/utils';
import { useNavActiveState } from '@/hooks/use-nav-active-state';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
  forceRefresh?: number; // Added to force re-renders
}

const Sidebar = ({ role, forceRefresh = 0 }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isActive } = useNavActiveState();
  const customerNavItems = useCustomerNavItems();
  const [navItemsState, setNavItemsState] = useState<NavItem[]>([]);
  const [isNavLoading, setIsNavLoading] = useState(true);
  const [featureUpdateCount, setFeatureUpdateCount] = useState(0); // Counter to force rerenders

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Subscribe to feature updates with improved error handling
  useEffect(() => {
    if (role === 'customer') {
      console.log('[Sidebar] Setting up feature updates subscription');
      
      // General subscription for all feature-related tables
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
            // Force immediate rerender on feature changes
            setFeatureUpdateCount(prev => prev + 1);
            
            // Removed notifications about feature changes
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Sidebar] Successfully subscribed to company_features changes');
          } else {
            console.error('[Sidebar] Subscription status:', status);
          }
        });
        
      // Subscribe to company_users changes for KPI access
      const kpiChannel = supabase
        .channel('sidebar-kpi-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'company_users' 
          }, 
          (payload) => {
            console.log('[Sidebar] Detected change in company_users:', payload);
            
            // Check if is_manager_kpi_enabled has changed
            if (payload.eventType === 'UPDATE' && 
                payload.new && payload.old && 
                'is_manager_kpi_enabled' in payload.new && 
                'is_manager_kpi_enabled' in payload.old && 
                payload.new.is_manager_kpi_enabled !== payload.old.is_manager_kpi_enabled) {
              
              console.log('[Sidebar] KPI access changed, forcing navigation update');
              setFeatureUpdateCount(prev => prev + 1);
              
              // Show notification about KPI access change
              if (payload.new.is_manager_kpi_enabled) {
                toast({
                  title: "KPI Dashboard Enabled",
                  description: "Manager KPI Dashboard is now available in your menu",
                  variant: "default"
                });
              } else {
                toast({
                  title: "KPI Dashboard Disabled",
                  description: "Manager KPI Dashboard has been disabled",
                  variant: "default"
                });
              }
            }
          }
        )
        .subscribe();
        
      return () => {
        console.log('[Sidebar] Cleaning up feature updates subscription');
        supabase.removeChannel(channel);
        supabase.removeChannel(kpiChannel);
      };
    }
  }, [role]);

  // Get navigation items based on role with dependency on forceRefresh
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
      
      // Debug log for the Manager KPI item
      if (item.href === '/customer/manager-kpi') {
        console.log('[Sidebar] Manager KPI item is present in sidebar with active state:', active);
      }
      
      return {
        ...item,
        active
      };
    });
    
    setNavItemsState(itemsWithActiveState);
    setIsNavLoading(false);
  }, [customerNavItems, role, location.pathname, isActive, featureUpdateCount, forceRefresh]);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log('[SidebarNav] Path changed to:', location.pathname);
    
    // Check if Jobangebote is in the menu
    const hasJobangebote = navItemsState.some(i => i.href === '/customer/job-parsing');
    console.log('[SidebarNav] Jobangebote visible in menu:', hasJobangebote);
    
    // Check if Manager KPI is in the menu
    const hasManagerKPI = navItemsState.some(i => i.href === '/customer/manager-kpi');
    console.log('[SidebarNav] Manager KPI visible in menu:', hasManagerKPI);
    
    // For customer role, log all menu items
    if (role === 'customer') {
      console.log('[SidebarNav] Customer menu items:', 
        navItemsState.map(i => ({ name: i.name, href: i.href }))
      );
      
      // If Jobangebote should be visible but isn't, try to force a refresh
      if (!hasJobangebote && location.pathname === '/customer/job-parsing') {
        console.log('[SidebarNav] Currently on job-parsing page but menu item is missing, triggering refresh');
        setFeatureUpdateCount(prev => prev + 1);
      }
      
      // If Manager KPI should be visible but isn't, try to force a refresh
      if (!hasManagerKPI && location.pathname === '/customer/manager-kpi') {
        console.log('[SidebarNav] Currently on manager-kpi page but menu item is missing, triggering refresh');
        setFeatureUpdateCount(prev => prev + 1);
      }
    }
  }, [location.pathname, navItemsState, role]);

  // Add special keyboard shortcuts for testing
  useEffect(() => {
    if (role === 'customer') {
      // Add keyboard shortcuts for direct feature access testing
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ctrl+Alt+J to force navigate to job-parsing
        if (e.ctrlKey && e.altKey && e.key === 'j') {
          console.log('[Sidebar] Detected keyboard shortcut - forcing navigation to job-parsing page');
          navigate('/customer/job-parsing');
          e.preventDefault();
        }
        
        // Ctrl+Alt+K to force navigate to manager-kpi
        if (e.ctrlKey && e.altKey && e.key === 'k') {
          console.log('[Sidebar] Detected keyboard shortcut - forcing navigation to manager-kpi page');
          navigate('/customer/manager-kpi');
          e.preventDefault();
        }
        
        // Ctrl+Alt+R to force refresh navigation
        if (e.ctrlKey && e.altKey && e.key === 'r') {
          console.log('[Sidebar] Detected keyboard shortcut - forcing navigation refresh');
          setFeatureUpdateCount(prev => prev + 1);
          e.preventDefault();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [role, navigate]);

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
