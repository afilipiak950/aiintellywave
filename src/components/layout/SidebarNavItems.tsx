
import { NAV_ITEMS } from './navigation/constants';
import { NavItem, NavItemsByRole } from './navigation/types';
import { addManagerKPINavItem } from './navigation/managerKpiUtils';

export type { NavItem };
export { NAV_ITEMS, addManagerKPINavItem };

export const createNavItems = (translations: any) => {
  // Create a copy of customer nav items
  const customerNavItems = [...NAV_ITEMS.customer];

  // Return a modified version of NAV_ITEMS
  return {
    ...NAV_ITEMS,
    customer: customerNavItems,
  };
};
