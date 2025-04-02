
import { NavItem, NavItemsByRole } from './types';
import { NAV_ITEMS } from './constants';

/**
 * Creates navigation items with translations applied
 * @param translations Translation dictionary
 * @returns Object with navigation items by role
 */
export const createNavItems = (translations: any) => {
  // Create a copy of customer nav items
  const customerNavItems = [...NAV_ITEMS.customer];

  // Return a modified version of NAV_ITEMS
  return {
    ...NAV_ITEMS,
    customer: customerNavItems,
  };
};
