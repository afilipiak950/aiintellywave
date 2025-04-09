
import { NavItem, NavItemsByRole } from './types';

// Create a utility function to generate navigation items by role
export function getNavItemsForRole(role: string, items: NavItemsByRole): NavItem[] {
  return items[role as keyof NavItemsByRole] || [];
}
