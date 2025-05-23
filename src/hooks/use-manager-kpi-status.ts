
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NavItem } from '@/components/layout/navigation/types';
import { addManagerKPINavItem } from '@/components/layout/navigation/managerKpiUtils';
import { MANAGER_KPI_ITEM } from '@/components/layout/navigation/constants';
import { toast } from './use-toast';

export function useManagerKPIStatus(initialNavItems: NavItem[]) {
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasKpiEnabled, setHasKpiEnabled] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toISOString());

  const refreshNavItems = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      console.log('[useManagerKPIStatus] Refreshing Manager KPI status...', 
        forceRefresh ? '(forced refresh)' : '');

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[useManagerKPIStatus] No authenticated user found, using initial nav items');
        setNavItems(initialNavItems);
        setHasKpiEnabled(false);
        setIsLoading(false);
        return;
      }

      // Store user ID for debugging and reference
      setUserId(user.id);
      console.log('[useManagerKPIStatus] Checking KPI status for user:', user.id);

      // Query without any caching options
      const { data, error } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled, role, company_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('[useManagerKPIStatus] Error checking manager KPI status:', error);
        
        // Try fallback to user metadata for role if query fails
        if (user.user_metadata && (user.user_metadata.role === 'manager' || user.user_metadata.role === 'admin')) {
          console.log('[useManagerKPIStatus] Using fallback role from user metadata:', user.user_metadata.role);
          setHasKpiEnabled(true);
          const updatedNavItems = await addManagerKPINavItem(initialNavItems, true);
          setNavItems(updatedNavItems);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Error checking KPI access",
          description: "Could not verify Manager KPI access. Please try again later.",
          variant: "destructive"
        });
        setNavItems(initialNavItems);
        setIsLoading(false);
        return;
      }

      // Log full data for debugging
      console.log('[useManagerKPIStatus] All company_users records for current user:', data);

      if (!data || data.length === 0) {
        console.warn('[useManagerKPIStatus] No company_users records found for user:', user.id);
        
        // Try fallback to user metadata for role if no records found
        if (user.user_metadata && (user.user_metadata.role === 'manager' || user.user_metadata.role === 'admin')) {
          console.log('[useManagerKPIStatus] Using fallback role from user metadata:', user.user_metadata.role);
          setHasKpiEnabled(true);
          const updatedNavItems = await addManagerKPINavItem(initialNavItems, true);
          setNavItems(updatedNavItems);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
        
        setNavItems(initialNavItems);
        setHasKpiEnabled(false);
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }

      // Check if any record has KPI enabled - the user should see the dashboard if ANY company has it enabled
      const kpiEnabled = data.some(row => row.is_manager_kpi_enabled === true) || false;
      console.log(
        '[useManagerKPIStatus] KPI enabled status from DB:', 
        kpiEnabled, 
        'based on records:', 
        data.map(r => ({ company: r.company_id, enabled: r.is_manager_kpi_enabled }))
      );
      setHasKpiEnabled(kpiEnabled);

      // Call the function with explicit true/false flag to force the correct state
      const updatedNavItems = await addManagerKPINavItem(initialNavItems, kpiEnabled);
      console.log('[useManagerKPIStatus] Updated nav items after addManagerKPINavItem:', updatedNavItems.length);
      
      // Verify the Manager KPI item was correctly added/removed
      const hasManagerKPI = updatedNavItems.some(item => item.href === '/customer/manager-kpi');
      console.log('[useManagerKPIStatus] KPI should be enabled:', kpiEnabled, 'KPI item exists:', hasManagerKPI);
      
      if (kpiEnabled && !hasManagerKPI) {
        console.error('[useManagerKPIStatus] ERROR: Failed to add Manager KPI item to navigation despite being enabled!');
        
        // Try one more time as a fallback
        const retryItems = [...initialNavItems]; // Use initialNavItems instead of updatedNavItems for clean retry
        const settingsIndex = retryItems.findIndex(item => item.href?.includes('/settings'));
        
        if (settingsIndex !== -1) {
          // Use the imported MANAGER_KPI_ITEM instead of creating a new one
          retryItems.splice(settingsIndex, 0, MANAGER_KPI_ITEM);
          console.log('[useManagerKPIStatus] Forcefully added Manager KPI as fallback');
          setNavItems(retryItems);
        } else {
          setNavItems(updatedNavItems);
        }
      } else {
        setNavItems(updatedNavItems);
      }
      
      // Update refresh timestamp
      setLastRefreshed(new Date().toISOString());
      setIsInitialized(true);
    } catch (error) {
      console.error('[useManagerKPIStatus] Error in useManagerKPIStatus:', error);
      toast({
        title: "Error loading navigation",
        description: "There was a problem loading the navigation menu. Please refresh the page.",
        variant: "destructive"
      });
      // Fallback to initial items in case of error
      setNavItems(initialNavItems);
    } finally {
      setIsLoading(false);
    }
  }, [initialNavItems]);

  // Initial check on mount
  useEffect(() => {
    if (!isInitialized) {
      refreshNavItems();
    }
  }, [refreshNavItems, isInitialized]);

  // Add subscription to realtime updates for company_users table
  useEffect(() => {
    if (!userId) return;
    
    console.log('[useManagerKPIStatus] Setting up realtime subscription for KPI updates');
    
    const channel = supabase
      .channel('manager-kpi-status-changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'company_users',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('[useManagerKPIStatus] Realtime update detected:', payload);
          // Force refresh when company_users is updated
          refreshNavItems(true);
        }
      )
      .subscribe();
      
    return () => {
      console.log('[useManagerKPIStatus] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, refreshNavItems]);

  return {
    navItems,
    isLoading,
    hasKpiEnabled,
    refreshNavItems,
    userId,
    lastRefreshed
  };
}
