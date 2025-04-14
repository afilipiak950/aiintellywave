
import { ADMIN_NAV_ITEMS, MANAGER_NAV_ITEMS } from './navigation/constants';
import { useCustomerNavItems } from '@/hooks/use-customer-nav-items';
import { NavItem } from './navigation/types';

// Re-export for backwards compatibility
export type { NavItem };
export { ADMIN_NAV_ITEMS, MANAGER_NAV_ITEMS };
export { useCustomerNavItems };

// Base customer nav items are exported for direct usage where needed
export { BASE_CUSTOMER_NAV_ITEMS as CUSTOMER_NAV_ITEMS } from './navigation/customer-nav-items';
