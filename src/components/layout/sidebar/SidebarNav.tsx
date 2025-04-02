
import { useState, useEffect, useCallback } from 'react';
import { NavItem, addManagerKPINavItem } from '../SidebarNavItems';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

interface SidebarNavProps {
  navItems: NavItem[];
  collapsed: boolean;
}

export const SidebarNav = ({ navItems: initialNavItems, collapsed }: SidebarNavProps) => {
  const location = useLocation();
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use a callback to fetch Manager KPI status to avoid page reloads
  const fetchManagerKPIStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get all records matching the user (don't use single() due to potential multiple rows)
      const { data: companyUserData, error } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled')
        .eq('user_id', user.id);

      console.log('Manager KPI status fetch response:', companyUserData, error);

      if (!error && companyUserData && companyUserData.length > 0) {
        // Use the first record's value
        const isEnabled = Boolean(companyUserData[0]?.is_manager_kpi_enabled);
        console.log('Manager KPI enabled status:', isEnabled);

        if (isEnabled) {
          // Update nav items with Manager KPI if enabled
          const updatedItems = await addManagerKPINavItem(initialNavItems);
          setNavItems(updatedItems);
        } else {
          // If not enabled, just use initial items without the KPI item
          const filteredItems = initialNavItems.filter(
            item => item.path !== '/customer/manager-kpi'
          );
          setNavItems(filteredItems);
        }
      } else {
        // If error or no data, just use initial items
        setNavItems(initialNavItems);
        if (error) {
          console.error('Error fetching Manager KPI status:', error);
        }
      }
    } catch (error) {
      console.error('Error checking Manager KPI access:', error);
      setNavItems(initialNavItems);
    } finally {
      setIsLoading(false);
    }
  }, [initialNavItems]);
  
  // Fetch Manager KPI status on component mount and when location changes
  useEffect(() => {
    fetchManagerKPIStatus();
  }, [fetchManagerKPIStatus, location.pathname]);

  // Set up a real-time subscription to company_users changes
  useEffect(() => {
    const channel = supabase
      .channel('company_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_users'
        },
        (payload) => {
          console.log('Company users changed:', payload);
          // Refresh the navigation when the company_users table changes
          fetchManagerKPIStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchManagerKPIStatus]);
  
  // Helper function to check if a nav item is active
  const isActive = (navPath: string | undefined) => {
    // If path is undefined, it can't be active
    if (!navPath) return false;
    
    // Fix for dashboard path - make it active when at the root of the role
    if (navPath.endsWith('/dashboard')) {
      const basePath = navPath.split('/dashboard')[0];
      if (location.pathname === basePath || location.pathname === `${basePath}/` || 
          location.pathname === navPath || location.pathname === `${navPath}/`) {
        return true;
      }
    }
    
    return location.pathname === navPath || location.pathname.startsWith(`${navPath}/`);
  };
  
  // Add debug logging for navigation items
  useEffect(() => {
    console.log('Current navItems:', navItems);
    console.log('Current path:', location.pathname);
  }, [navItems, location.pathname]);
  
  return (
    <div className="flex-1 overflow-y-auto py-6">
      <nav className="px-2 space-y-1">
        {isLoading ? (
          // Show loading placeholders
          Array.from({ length: 5 }).map((_, index) => (
            <div 
              key={`nav-loading-${index}`} 
              className="h-10 bg-sidebar-hover/20 animate-pulse rounded-md mb-1"
            />
          ))
        ) : (
          navItems.map((item) => {
            // Check if path exists before trying to use it to determine if active
            const active = item.path ? isActive(item.path) : false;

            return (
              <Link
                key={item.path || `nav-item-${item.name}`}
                to={item.href || '#'}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md uppercase",
                  active
                    ? "bg-sidebar-active text-white"
                    : "text-gray-300 hover:bg-sidebar-hover hover:text-white",
                  collapsed ? "justify-center" : ""
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    active ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                  )}
                />
                {!collapsed && (
                  <span className="ml-3 whitespace-nowrap uppercase">{item.name}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase",
                      item.badge.variant === "default"
                        ? "bg-blue-100 text-blue-800"
                        : item.badge.variant === "secondary"
                        ? "bg-gray-100 text-gray-800"
                        : item.badge.variant === "outline"
                        ? "bg-transparent text-gray-400 border border-gray-200"
                        : "bg-red-100 text-red-800"
                    )}
                  >
                    {item.badge.text}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );
};
