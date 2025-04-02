
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NavItem, addManagerKPINavItem } from '@/components/layout/SidebarNavItems';

export function useManagerKPIStatus(initialNavItems: NavItem[]) {
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasKpiEnabled, setHasKpiEnabled] = useState<boolean>(false);

  const refreshNavItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNavItems(initialNavItems);
        return;
      }

      // Check if manager KPI is enabled for this user
      const { data, error } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking manager KPI status:', error);
        setNavItems(initialNavItems);
        return;
      }

      // Check if any record has KPI enabled
      const kpiEnabled = data?.some(row => row.is_manager_kpi_enabled === true) || false;
      setHasKpiEnabled(kpiEnabled);

      // Update the navigation items
      const updatedNavItems = await addManagerKPINavItem(initialNavItems, kpiEnabled);
      setNavItems(updatedNavItems);
    } catch (error) {
      console.error('Error in useManagerKPIStatus:', error);
    } finally {
      setIsLoading(false);
    }
  }, [initialNavItems]);

  // Initial check on mount
  useEffect(() => {
    refreshNavItems();
  }, [refreshNavItems]);

  return {
    navItems,
    isLoading,
    hasKpiEnabled,
    refreshNavItems
  };
}
