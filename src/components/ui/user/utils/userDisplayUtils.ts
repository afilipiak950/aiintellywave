
import { Customer } from '@/hooks/customers/types';

/**
 * Get a display name for a user based on available fields
 */
export const getDisplayName = (user: Customer): string => {
  if (!user) return 'Unknown';
  return user.name || user.full_name || user.email || user.contact_email || 'Unknown';
};

/**
 * Check if a user object is valid and has necessary fields
 */
export const isValidUser = (user: Customer | null | undefined): boolean => {
  return !!user && !!user.id;
};
