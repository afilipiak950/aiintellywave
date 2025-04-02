
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NavItem } from '@/components/layout/navigation/types';
import { addManagerKPINavItem } from '@/components/layout/navigation/managerKpiUtils';
import { toast } from './use-toast';

export function useManagerKPIStatus(initialNavItems: NavItem[]) {
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasKpiEnabled, setHasKpiEnabled] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const refreshNavItems = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('[useManagerKPIStatus] Refreshing Manager KPI status... (Try #' + (retryCount + 1) + ')');

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[useManagerKPIStatus] No authenticated user found, using initial nav items');
        setNavItems(initialNavItems);
        setHasKpiEnabled(false);
        return;
      }

      // Store user ID for debugging and reference
      setUserId(user.id);
      console.log('[useManagerKPIStatus] Checking KPI status for user:', user.id);

      // Fetch ALL company_users records for this user to check if ANY have KPI enabled
      const { data, error } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled, role, company_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('[useManagerKPIStatus] Error checking manager KPI status:', error);
        toast({
          title: "Error checking KPI access",
          description: "Could not verify Manager KPI access. Please try again later.",
          variant: "destructive"
        });
        setNavItems(initialNavItems);
        return;
      }

      // Log full data for debugging
      console.log('[useManagerKPIStatus] All company_users records for current user:', data);

      if (!data || data.length === 0) {
        console.warn('[useManagerKPIStatus] No company_users records found for user:', user.id);
        setNavItems(initialNavItems);
        setHasKpiEnabled(false);
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }

      // Check if ANY record has KPI enabled - the user should see the dashboard if ANY company has it enabled
      const kpiEnabled = data.some(row => row.is_manager_kpi_enabled === true);
      
      // Log detailed information about which companies have KPI enabled
      const kpiEnabledCompanies = data
        .filter(row => row.is_manager_kpi_enabled === true)
        .map(row => row.company_id);
        
      console.log(
        '[useManagerKPIStatus] KPI enabled status from DB:', 
        kpiEnabled, 
        'based on records:', 
        data.map(r => ({ company: r.company_id, enabled: r.is_manager_kpi_enabled }))
      );
      
      if (kpiEnabled) {
        console.log('[useManagerKPIStatus] KPI enabled for companies:', kpiEnabledCompanies);
      }
      
      setHasKpiEnabled(kpiEnabled);

      // Call the function with explicit true/false flag to force the correct state
      let updatedNavItems = await addManagerKPINavItem(initialNavItems, kpiEnabled);
      console.log('[useManagerKPIStatus] Updated nav items after addManagerKPINavItem:', updatedNavItems.length);
      
      // Verify the Manager KPI item was correctly added/removed
      const hasManagerKPI = updatedNavItems.some(item => item.path === '/customer/manager-kpi');
      console.log('[useManagerKPIStatus] KPI should be enabled:', kpiEnabled, 'KPI item exists:', hasManagerKPI);
      
      // If there's a mismatch between what should be shown and what's actually showing, retry logic
      if (kpiEnabled && !hasManagerKPI) {
        console.error('[useManagerKPIStatus] ERROR: Failed to add Manager KPI item to navigation despite being enabled!');
        
        // Directly modify the navItems if the utility function failed
        const { MANAGER_KPI_ITEM } = await import('@/components/layout/navigation/constants');
        const settingsIndex = updatedNavItems.findIndex(item => item.path?.includes('/settings'));
        
        if (settingsIndex !== -1) {
          // Create a deep clone to avoid reference issues
          const kpiItemClone = JSON.parse(JSON.stringify(MANAGER_KPI_ITEM));
          updatedNavItems.splice(settingsIndex, 0, kpiItemClone);
          console.log('[useManagerKPIStatus] Manually added Manager KPI item before Settings');
        } else {
          updatedNavItems.push(JSON.parse(JSON.stringify(MANAGER_KPI_ITEM)));
          console.log('[useManagerKPIStatus] Manually added Manager KPI item at the end');
        }
      }
      
      setNavItems(updatedNavItems);
      setIsInitialized(true);
      
      // Reset retry counter on success
      if (retryCount > 0) {
        setRetryCount(0);
      }
    } catch (error) {
      console.error('[useManagerKPIStatus] Error in useManagerKPIStatus:', error);
      
      if (retryCount < 3) {
        // Implement exponential backoff for retries
        const delay = Math.pow(2, retryCount) * 500;
        console.log(`[useManagerKPIStatus] Will retry after ${delay}ms (attempt ${retryCount + 1}/3)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      } else {
        toast({
          title: "Error loading navigation",
          description: "There was a problem loading the navigation menu. Please refresh the page.",
          variant: "destructive"
        });
        // Fallback to initial items in case of error
        setNavItems(initialNavItems);
      }
    } finally {
      setIsLoading(false);
    }
  }, [initialNavItems, retryCount]);

  // Initial check on mount
  useEffect(() => {
    if (!isInitialized || retryCount > 0) {
      refreshNavItems();
    }
  }, [refreshNavItems, isInitialized, retryCount]);

  // Set up polling to check for changes periodically
  useEffect(() => {
    // Only set up polling if we have a user ID
    if (!userId) return;
    
    // Check every 30 seconds for any KPI setting changes
    const interval = setInterval(() => {
      console.log('[useManagerKPIStatus] Periodic KPI status check');
      refreshNavItems();
    }, 30000); // 30 seconds
    
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
