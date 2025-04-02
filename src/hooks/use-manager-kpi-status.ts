
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NavItem, addManagerKPINavItem } from '@/components/layout/SidebarNavItems';
import { toast } from './use-toast';

export function useManagerKPIStatus(initialNavItems: NavItem[]) {
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasKpiEnabled, setHasKpiEnabled] = useState<boolean>(false);

  const refreshNavItems = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Refreshing Manager KPI status...');

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found, using initial nav items');
        setNavItems(initialNavItems);
        setHasKpiEnabled(false);
        return;
      }

      console.log('Checking KPI status for user:', user.id);

      // Check if manager KPI is enabled for this user
      const { data, error } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking manager KPI status:', error);
        toast({
          title: "Error checking KPI access",
          description: "Could not verify Manager KPI access. Please try again later.",
          variant: "destructive"
        });
        setNavItems(initialNavItems);
        return;
      }

      console.log('Company users data for KPI check:', data);

      // Check if any record has KPI enabled
      const kpiEnabled = data?.some(row => row.is_manager_kpi_enabled === true) || false;
      console.log('KPI enabled status:', kpiEnabled);
      setHasKpiEnabled(kpiEnabled);

      // Update the navigation items with the KPI status
      console.log('Updating nav items with KPI status:', kpiEnabled);
      const updatedNavItems = await addManagerKPINavItem(initialNavItems, kpiEnabled);
      console.log('Updated nav items:', updatedNavItems);
      
      // Check if the Manager KPI item was actually added when it should be
      const hasManagerKPI = updatedNavItems.some(item => item.path === '/customer/manager-kpi');
      if (kpiEnabled && !hasManagerKPI) {
        console.error('Failed to add Manager KPI item to navigation!');
      } else if (kpiEnabled) {
        console.log('Manager KPI item was successfully added');
      }

      setNavItems(updatedNavItems);
    } catch (error) {
      console.error('Error in useManagerKPIStatus:', error);
      toast({
        title: "Error loading navigation",
        description: "There was a problem loading the navigation menu. Please refresh the page.",
        variant: "destructive"
      });
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
