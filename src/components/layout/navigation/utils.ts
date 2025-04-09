
import { NavItem, NavItemsByRole } from './types';

// Create a utility function to generate navigation items by role
export function getNavItemsForRole(role: string, items: NavItemsByRole): NavItem[] {
  if (!items || !role || !(role in items)) {
    console.warn(`No navigation items found for role: ${role}`);
    return [];
  }
  
  return items[role as keyof NavItemsByRole] || [];
}
