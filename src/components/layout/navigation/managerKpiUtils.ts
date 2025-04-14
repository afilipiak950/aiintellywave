
import { NavItem } from './types';
import { MANAGER_KPI_ITEM } from './constants';

export async function addManagerKPINavItem(navItems: NavItem[], shouldAdd: boolean): Promise<NavItem[]> {
  const newNavItems = [...navItems];
  
  // Remove any existing Manager KPI items first to avoid duplicates
  const filteredItems = newNavItems.filter(item => item.href !== '/customer/manager-kpi');
  
  // Add KPI item before Settings if feature is enabled
  if (shouldAdd) {
    const settingsIndex = filteredItems.findIndex(item => item.href?.includes('/settings'));
    
    if (settingsIndex !== -1) {
      filteredItems.splice(settingsIndex, 0, MANAGER_KPI_ITEM);
      console.log('[addManagerKPINavItem] Added Manager KPI to navigation items');
    } else {
      // If no settings item found, add to the end
      filteredItems.push(MANAGER_KPI_ITEM);
      console.log('[addManagerKPINavItem] Added Manager KPI to end of navigation items (no settings found)');
    }
  } else {
    console.log('[addManagerKPINavItem] Manager KPI disabled, not adding to navigation');
  }
  
  return filteredItems;
}
