
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NavItem, addManagerKPINavItem } from '@/components/layout/SidebarNavItems';

export const useManagerKPIStatus = (initialNavItems: NavItem[]) => {
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Manager KPI status
  const fetchManagerKPIStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return;
      }
      
      console.log('Checking KPI status for user:', user.id);

      // Get company user records for this user
      const { data: companyUsers, error: cuError } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled, company_id')
        .eq('user_id', user.id);
        
      if (cuError) {
        console.error('Error fetching company_users:', cuError);
        setIsLoading(false);
        return;
      }
      
      console.log('Company users data:', companyUsers);
      
      // Check if ANY record has KPI enabled
      const hasKpiEnabled = companyUsers?.some(record => record.is_manager_kpi_enabled === true);
      console.log('Has KPI enabled:', hasKpiEnabled);
      
      // Create a copy of initialNavItems before modification
      let updatedItems = [...initialNavItems];
      
      if (hasKpiEnabled) {
        console.log('Adding Manager KPI to navigation items');
        updatedItems = await addManagerKPINavItem(updatedItems, true);
      } else {
        console.log('Removing Manager KPI from navigation items');
        updatedItems = await addManagerKPINavItem(updatedItems, false);
      }
      
      setNavItems(updatedItems);
      console.log('Updated navigation items:', updatedItems);
    } catch (error) {
      console.error('Error checking Manager KPI access:', error);
      setNavItems(initialNavItems);
    } finally {
      setIsLoading(false);
    }
  }, [initialNavItems]);

  // Set up real-time subscription to company_users changes
  useEffect(() => {
    console.log('Setting up real-time subscription to company_users');
    
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
      console.log('Removing subscription to company_users');
      supabase.removeChannel(channel);
    };
  }, [fetchManagerKPIStatus]);

  // Initial fetch of KPI status
  useEffect(() => {
    console.log('useManagerKPIStatus: Fetching KPI status');
    fetchManagerKPIStatus();
  }, [fetchManagerKPIStatus]);

  return { navItems, isLoading, refreshNavItems: fetchManagerKPIStatus };
};
