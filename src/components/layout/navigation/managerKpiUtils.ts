
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
  // Create a copy of the array to avoid mutating the original
  let itemsCopy = [...navItems];
  
  try {
    console.log('[managerKpiUtils] Adding/removing Manager KPI based on forceState:', forceState);
    
    // Check if the Manager KPI item already exists
    const kpiExists = itemsCopy.some(item => item.path === '/customer/manager-kpi');
    console.log('[managerKpiUtils] KPI item exists in navigation:', kpiExists);
    
    // Handle force states first (for explicit enable/disable)
    if (forceState === true) {
      // Force add the item if it doesn't exist
      if (!kpiExists) {
        console.log('[managerKpiUtils] Force adding Manager KPI item');
        
        // Find best location to insert the item (before Settings)
        const settingsIndex = itemsCopy.findIndex(item => item.path?.includes('/settings'));
        if (settingsIndex !== -1) {
          // Insert before Settings
          console.log(`[managerKpiUtils] Adding Manager KPI before Settings at index ${settingsIndex}`);
          itemsCopy.splice(settingsIndex, 0, MANAGER_KPI_ITEM);
        } else {
          // If no Settings item found, add to end
          console.log('[managerKpiUtils] No Settings item found, adding Manager KPI to end');
          itemsCopy.push(MANAGER_KPI_ITEM);
        }
      }
      return itemsCopy;
    } 
    
    if (forceState === false) {
      // Force remove the item if it exists
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
    
    // Get all records for this user
    const { data: companyUserData, error } = await supabase
      .from('company_users')
      .select('is_manager_kpi_enabled')
      .eq('user_id', user.id);

    if (error) {
      console.error('[managerKpiUtils] Error fetching Manager KPI status:', error);
      return itemsCopy;
    }
    
    if (!companyUserData || companyUserData.length === 0) {
      console.log('[managerKpiUtils] No company user data found');
      return itemsCopy;
    }
    
    console.log('[managerKpiUtils] Company user data:', companyUserData);
    
    // Check if any row has the KPI enabled
    const isKpiEnabled = companyUserData.some(row => row.is_manager_kpi_enabled === true);
    console.log('[managerKpiUtils] Is Manager KPI enabled (DB check):', isKpiEnabled);
    
    // Now properly handle adding or removing the menu item
    if (isKpiEnabled) {
      console.log('[managerKpiUtils] Manager KPI is enabled, ensuring it exists in navigation');
      
      if (!kpiExists) {
        // Find the best position to insert the item (before Settings)
        const settingsIndex = itemsCopy.findIndex(item => item.path?.includes('/settings'));
        
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
    } else {
      // Remove the item if it exists but should be disabled
      if (kpiExists) {
        console.log('[managerKpiUtils] Manager KPI is disabled, removing from navigation');
        itemsCopy = itemsCopy.filter(item => item.path !== '/customer/manager-kpi');
      }
    }

    console.log('[managerKpiUtils] Final navigation items count:', itemsCopy.length);
    return itemsCopy;
  } catch (error) {
    console.error('[managerKpiUtils] Error in addManagerKPINavItem:', error);
    // Return a copy to avoid mutation
    return [...navItems];
  }
};
