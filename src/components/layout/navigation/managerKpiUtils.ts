
import { NavItem } from './types';
import { MANAGER_KPI_ITEM } from './constants';
import { supabase } from '@/integrations/supabase/client';

/**
 * Adds or removes the Manager KPI menu item based on user permissions
 * @param navItems Current navigation items
 * @param forceState Optional parameter to force the state (true = add, false = remove)
 * @returns Updated navigation items array
 */
export const addManagerKPINavItem = async (navItems: NavItem[], forceState?: boolean): Promise<NavItem[]> => {
  // Create a deep copy of the array to avoid mutating the original
  let itemsCopy = JSON.parse(JSON.stringify(navItems));
  
  try {
    console.log('[managerKpiUtils] Adding/removing Manager KPI based on forceState:', forceState);
    
    // Check if the Manager KPI item already exists
    const kpiExists = itemsCopy.some(item => item.path === '/customer/manager-kpi');
    console.log('[managerKpiUtils] KPI item exists in navigation:', kpiExists);
    
    // Handle explicit force states first
    if (forceState === true) {
      if (!kpiExists) {
        console.log('[managerKpiUtils] Force adding Manager KPI item');
        
        // Find the best position (before Settings)
        const settingsIndex = itemsCopy.findIndex(item => 
          item.path?.includes('/settings') || item.path?.includes('/customer/settings')
        );
        
        // Create a deep clone of the KPI item to avoid reference issues
        const kpiItemClone = JSON.parse(JSON.stringify(MANAGER_KPI_ITEM));
        
        if (settingsIndex !== -1) {
          // Insert before Settings
          console.log(`[managerKpiUtils] Adding Manager KPI before Settings at index ${settingsIndex}`);
          itemsCopy.splice(settingsIndex, 0, kpiItemClone);
        } else {
          // If no Settings item found, add to end
          console.log('[managerKpiUtils] No Settings item found, adding Manager KPI to end');
          itemsCopy.push(kpiItemClone);
        }
      }
      return itemsCopy;
    } 
    
    if (forceState === false) {
      if (kpiExists) {
        console.log('[managerKpiUtils] Force removing Manager KPI item');
        itemsCopy = itemsCopy.filter(item => item.path !== '/customer/manager-kpi');
      }
      return itemsCopy;
    }
    
    // If forceState is undefined, check the database
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[managerKpiUtils] No user found, returning original nav items');
      return itemsCopy;
    }

    console.log('[managerKpiUtils] Checking KPI status for user ID:', user.id);
    
    // Get ALL company_users records for this user - check if ANY have KPI enabled
    const { data: companyUserData, error } = await supabase
      .from('company_users')
      .select('is_manager_kpi_enabled, company_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('[managerKpiUtils] Error fetching Manager KPI status:', error);
      return itemsCopy;
    }
    
    if (!companyUserData || companyUserData.length === 0) {
      console.log('[managerKpiUtils] No company user data found');
      return itemsCopy;
    }
    
    console.log('[managerKpiUtils] Company user records found:', companyUserData.length);
    
    // Check if ANY row has the KPI enabled - this is important for users with multiple companies
    const isKpiEnabled = companyUserData.some(row => row.is_manager_kpi_enabled === true);
    console.log('[managerKpiUtils] Is Manager KPI enabled (DB check):', isKpiEnabled);
    
    // For debugging, log companies with KPI enabled
    if (isKpiEnabled) {
      const enabledCompanies = companyUserData
        .filter(row => row.is_manager_kpi_enabled === true)
        .map(row => row.company_id);
      console.log('[managerKpiUtils] Companies with KPI enabled:', enabledCompanies);
    }
    
    // Now add or remove the menu item
    if (isKpiEnabled) {
      // Add KPI item if not already present
      if (!kpiExists) {
        const settingsIndex = itemsCopy.findIndex(item => 
          item.path?.includes('/settings') || item.path?.includes('/customer/settings')
        );
        
        // Deep clone the item to avoid reference issues
        const kpiItemClone = JSON.parse(JSON.stringify(MANAGER_KPI_ITEM));
        
        if (settingsIndex !== -1) {
          itemsCopy.splice(settingsIndex, 0, kpiItemClone);
          console.log('[managerKpiUtils] Added KPI item before settings at index', settingsIndex);
        } else {
          itemsCopy.push(kpiItemClone);
          console.log('[managerKpiUtils] Added KPI item at end of navigation');
        }
      }
    } else {
      // Remove KPI item if it exists
      if (kpiExists) {
        itemsCopy = itemsCopy.filter(item => item.path !== '/customer/manager-kpi');
        console.log('[managerKpiUtils] Removed KPI item from navigation');
      }
    }

    return itemsCopy;
  } catch (error) {
    console.error('[managerKpiUtils] Error in addManagerKPINavItem:', error);
    // Return a deep copy to avoid mutation
    return JSON.parse(JSON.stringify(navItems));
  }
};
