
// This file now re-exports from a differently named implementation file
// to avoid circular dependency issues
import { useRevenueDashboard as mainHook } from '@/hooks/revenue/use-revenue-dashboard-impl';

// Re-export the hook with its type definition
export const useRevenueDashboard = mainHook;

// Default export for existing imports
export default mainHook;
