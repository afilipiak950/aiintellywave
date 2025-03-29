
import { useEffect } from 'react';
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

  // Initial fetch
  useEffect(() => {
    console.log('useLeadQuery effect triggered', {
      user: !!user,
      userId: user?.id,
      projectId: options.projectId,
      status: options.status,
      assignedToUser: options.assignedToUser
    });
    
    if (user) {
      console.log('User authenticated, fetching leads...');
      fetchLeads(options)
        .then(result => {
          console.log('Fetch leads completed, got:', result?.length || 0, 'leads');
        })
        .catch(err => {
          console.error('Error in fetchLeads effect:', err);
        });
    } else {
      console.log('No authenticated user, skipping lead fetch');
    }
  }, [user, options.projectId, options.status, options.assignedToUser, fetchLeads]);

  return {
    fetchLeads: () => fetchLeads(options),
    createLead,
    updateLead,
    deleteLead
  };
};
