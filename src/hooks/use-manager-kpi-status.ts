
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NavItem, addManagerKPINavItem } from '@/components/layout/SidebarNavItems';
import { toast } from '@/hooks/use-toast';

export const useManagerKPIStatus = (initialNavItems: NavItem[]) => {
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [isLoading, setIsLoading] = useState(true);
  const [hasKpiEnabled, setHasKpiEnabled] = useState(false);

  // Fetch Manager KPI status
  const fetchManagerKPIStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw userError;
      }
      
      if (!user) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return;
      }
      
      console.log('Checking KPI status for user ID:', user.id);

      // Get company user records for this user
      const { data: companyUsers, error: cuError } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled, company_id')
        .eq('user_id', user.id);
        
      if (cuError) {
        console.error('Error fetching company_users:', cuError);
        setIsLoading(false);
        throw cuError;
      }
      
      console.log('Company users data:', companyUsers);
      
      // Check if ANY record has KPI enabled
      const kpiEnabled = companyUsers?.some(record => record.is_manager_kpi_enabled === true);
      console.log('Has KPI enabled:', kpiEnabled);
      setHasKpiEnabled(kpiEnabled);
      
      // Create a copy of initialNavItems before modification
      let updatedItems = [...initialNavItems];
      
      if (kpiEnabled) {
        console.log('Adding Manager KPI to navigation items');
        updatedItems = await addManagerKPINavItem(updatedItems, true);
      } else {
        console.log('Removing Manager KPI from navigation items');
        updatedItems = await addManagerKPINavItem(updatedItems, false);
      }
      
      setNavItems(updatedItems);
      console.log('Updated navigation items:', updatedItems);
      
      // Check if Manager KPI is now in the list after update
      const hasManagerKPI = updatedItems.some(item => item.path === '/customer/manager-kpi');
      if (kpiEnabled && !hasManagerKPI) {
        console.warn('WARNING: KPI is enabled but Manager KPI item is missing from nav items!');
        toast({
          title: "Navigation Error",
          description: "Manager KPI dashboard should be visible but couldn't be added to navigation.",
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      console.error('Error checking Manager KPI access:', error);
      toast({
        title: "Error",
        description: "Failed to check Manager KPI access status",
        variant: "destructive"
      });
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

  return { 
    navItems, 
    isLoading, 
    hasKpiEnabled,
    refreshNavItems: fetchManagerKPIStatus 
  };
};
