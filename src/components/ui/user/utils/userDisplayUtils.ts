
import { Customer } from '@/hooks/customers/types';

/**
 * Get a display name for a user based on available fields
 */
export const getDisplayName = (user: Customer): string => {
  return user.name || user.full_name || user.email || user.contact_email || 'Unknown';
};
