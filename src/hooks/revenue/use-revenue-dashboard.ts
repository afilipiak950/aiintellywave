
// This file now just re-exports from the main implementation file
import { useRevenueDashboard as mainHook } from '../use-revenue-dashboard';

// Re-export the hook with its type definition
export const useRevenueDashboard = mainHook;

// Default export for existing imports
export default mainHook;
