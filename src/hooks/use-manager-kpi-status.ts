
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NavItem } from '@/components/layout/navigation/types';
import { addManagerKPINavItem } from '@/components/layout/navigation/managerKpiUtils';
import { toast } from './use-toast';

export function useManagerKPIStatus(initialNavItems: NavItem[]) {
  // State management
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasKpiEnabled, setHasKpiEnabled] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Refresh nav items based on KPI status
  const refreshNavItems = useCallback(async () => {
    if (isLoading) return; // Prevent concurrent refresh operations

    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('[useManagerKPIStatus] No authenticated user found, using initial nav items');
        setNavItems(initialNavItems);
        setHasKpiEnabled(false);
        setIsLoading(false);
        return;
      }

      // Store user ID for reference
      setUserId(user.id);
      console.log('[useManagerKPIStatus] Checking KPI status for user:', user.id);

      // Fetch company_users records for this user
      const { data, error } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled, company_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('[useManagerKPIStatus] Error checking manager KPI status:', error);
        toast({
          title: "Error checking KPI access",
          description: "Could not verify Manager KPI access. Please try again later.",
          variant: "destructive"
        });
        setNavItems(initialNavItems);
        setIsLoading(false);
        return;
      }

      // Log data for debugging
      console.log('[useManagerKPIStatus] company_users records found:', data?.length || 0);
      
      // If no records found or empty array, just use initial nav items
      if (!data || data.length === 0) {
        console.warn('[useManagerKPIStatus] No company_users records found for user:', user.id);
        setNavItems(initialNavItems);
        setHasKpiEnabled(false);
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }

      // Check if ANY record has KPI enabled - user should see dashboard if ANY company has it enabled
      const kpiEnabled = data.some(row => row.is_manager_kpi_enabled === true);
      console.log('[useManagerKPIStatus] KPI enabled status:', kpiEnabled);
      
      // Log companies with KPI enabled for debugging
      if (kpiEnabled) {
        const enabledCompanies = data
          .filter(row => row.is_manager_kpi_enabled === true)
          .map(row => row.company_id);
        console.log('[useManagerKPIStatus] KPI enabled for companies:', enabledCompanies);
      }
      
      setHasKpiEnabled(kpiEnabled);

      // Safely update navigation items based on KPI status
      try {
        // Import constants separately to avoid reference issues
        const { MANAGER_KPI_ITEM } = await import('@/components/layout/navigation/constants');
        
        // Deep clone the initial nav items to avoid mutation
        let updatedNavItems = JSON.parse(JSON.stringify(initialNavItems));
        
        // Add or remove Manager KPI item based on status
        if (kpiEnabled) {
          // Check if KPI item already exists
          const hasKpiItem = updatedNavItems.some(item => item.path === '/customer/manager-kpi');
          
          if (!hasKpiItem) {
            // Find best position (before settings)
            const settingsIndex = updatedNavItems.findIndex(item => 
              item.path?.includes('/settings') || item.path?.includes('/customer/settings')
            );
            
            // Deep clone the item to avoid reference issues
            const kpiItem = JSON.parse(JSON.stringify(MANAGER_KPI_ITEM));
            
            if (settingsIndex !== -1) {
              // Insert before settings
              updatedNavItems.splice(settingsIndex, 0, kpiItem);
            } else {
              // Add to end if settings not found
              updatedNavItems.push(kpiItem);
            }
            
            console.log('[useManagerKPIStatus] Added Manager KPI item to navigation');
          }
        } else {
          // Remove KPI item if it exists
          updatedNavItems = updatedNavItems.filter(item => item.path !== '/customer/manager-kpi');
        }
        
        console.log('[useManagerKPIStatus] Updated navigation items count:', updatedNavItems.length);
        setNavItems(updatedNavItems);
        
      } catch (err) {
        console.error('[useManagerKPIStatus] Error updating navigation items:', err);
        // Fall back to using addManagerKPINavItem helper as backup
        const updatedNav = await addManagerKPINavItem(initialNavItems, kpiEnabled);
        setNavItems(updatedNav);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('[useManagerKPIStatus] Error in useManagerKPIStatus:', error);
      setNavItems(initialNavItems);
      toast({
        title: "Navigation error",
        description: "There was a problem loading your navigation menu. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [initialNavItems, isLoading]);

  // Initial load - only once
  useEffect(() => {
    if (!isInitialized) {
      refreshNavItems();
    }
  }, [isInitialized, refreshNavItems]);
  
  // Set up periodic polling for changes (every 30 seconds)
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      console.log('[useManagerKPIStatus] Periodic KPI status check');
      refreshNavItems();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [userId, refreshNavItems]);

  return {
    navItems,
    isLoading,
    hasKpiEnabled,
    refreshNavItems,
    userId
  };
}
