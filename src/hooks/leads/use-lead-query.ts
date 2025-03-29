
import { useEffect, useCallback } from 'react';
import { Lead } from '@/types/lead';
import { useAuth } from '@/context/auth';
import { useLeadOperations } from './use-lead-operations';

interface UseLeadQueryOptions {
  projectId?: string;
  status?: Lead['status'];
  assignedToUser?: boolean;
}

/**
 * Hook for querying leads data based on provided options
 */
export const useLeadQuery = (
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  options: UseLeadQueryOptions = {}
) => {
  const { user } = useAuth();
  const {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  } = useLeadOperations(setLeads, setLoading);

  // Initial fetch with better error handling
  const initialFetch = useCallback(async () => {
    try {
      console.log('DEEP DEBUG: useLeadQuery initialFetch triggered with options:', options);
      if (!user) {
        console.log('DEEP DEBUG: No authenticated user, skipping lead fetch');
        return;
      }
      
      console.log('DEEP DEBUG: Authenticated user found, fetching leads with ID:', user.id);
      const result = await fetchLeads(options);
      console.log(`DEEP DEBUG: Initial fetch completed, got: ${result?.length || 0} leads`);
      
      if (!result || result.length === 0) {
        console.log('DEEP DEBUG: No leads found in initial fetch, checking database directly');
        // Additional debugging for no leads case
      }
    } catch (err) {
      console.error('DEEP DEBUG: Error in initialFetch:', err);
    }
  }, [user, options.projectId, options.status, options.assignedToUser, fetchLeads]);

  // Initial fetch effect
  useEffect(() => {
    console.log('DEEP DEBUG: useLeadQuery effect triggered with user:', !!user);
    initialFetch();
  }, [initialFetch]);

  return {
    fetchLeads: () => fetchLeads(options),
    createLead,
    updateLead,
    deleteLead
  };
};
