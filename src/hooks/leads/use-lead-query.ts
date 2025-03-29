
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
      if (!user) {
        return;
      }
      
      await fetchLeads(options);
    } catch (err) {
      console.error('Error in initialFetch:', err);
    }
  }, [user, options.projectId, options.status, options.assignedToUser, fetchLeads]);

  // Initial fetch effect - runs only when dependencies change
  useEffect(() => {
    initialFetch();
  }, [initialFetch]);

  return {
    fetchLeads: () => fetchLeads(options),
    createLead,
    updateLead,
    deleteLead
  };
};
