
import { NavItem } from "./types";
import { MANAGER_KPI_ITEM } from "./constants";

/**
 * Adds the Manager KPI navigation item to the provided nav items array if enabled
 * @param navItems Original navigation items array
 * @param isEnabled Whether the Manager KPI module is enabled
 * @returns Updated navigation items array
 */
export async function addManagerKPINavItem(navItems: NavItem[], isEnabled: boolean): Promise<NavItem[]> {
  // Make a copy of the nav items to avoid mutating the original
  const updatedNavItems = [...navItems];
  
  try {
    if (isEnabled) {
      // Find the insertion point - we want to insert before the Settings item
      const settingsIndex = updatedNavItems.findIndex(item => 
        item.path?.includes('/settings') || item.href?.includes('/settings')
      );
      
      // Check if the Manager KPI item already exists in the nav items
      const kpiExists = updatedNavItems.some(item => 
        item.path === '/customer/manager-kpi' || item.href === '/customer/manager-kpi'
      );
      
      // Only add if enabled, doesn't exist yet, and we found a place to insert it
      if (isEnabled && !kpiExists && settingsIndex !== -1) {
        updatedNavItems.splice(settingsIndex, 0, MANAGER_KPI_ITEM);
        console.log('[managerKpiUtils] Added Manager KPI item to navigation');
      }
    } else {
      // If disabled, ensure the item is removed
      return updatedNavItems.filter(item => 
        item.path !== '/customer/manager-kpi' && item.href !== '/customer/manager-kpi'
      );
    }
  } catch (error) {
    console.error('[managerKpiUtils] Error in addManagerKPINavItem:', error);
  }
  
  return updatedNavItems;
}
