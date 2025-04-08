
import { useEffect, useCallback } from 'react';
import { Lead } from '@/types/lead';
import { useAuth } from '@/context/auth';
import { useLeadOperations } from './use-lead-operations';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  
  const {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  } = useLeadOperations(setLeads, setLoading);

  // Initial fetch with better error handling
  const initialFetch = useCallback(async () => {
    if (!user) {
      console.log('No authenticated user, skipping lead fetch');
      return;
    }
    
    console.log('Initiating lead fetch with options:', options);
    try {
      await fetchLeads(options);
    } catch (err) {
      console.error('Error in initialFetch:', err);
    }
  }, [user, options.projectId, options.status, options.assignedToUser, fetchLeads]);

  // Initial fetch effect - runs only when dependencies change
  useEffect(() => {
    // Check if we already have cached data before fetching
    const cachedLeads = queryClient.getQueryData(['leads', options.projectId, options.status, options.assignedToUser, user?.id]);
    
    if (!cachedLeads) {
      initialFetch();
    }
  }, [initialFetch, queryClient, options.projectId, options.status, options.assignedToUser, user?.id]);

  // Enhanced operations that update React Query cache
  const enhancedCreate = async (leadData: Partial<Lead>) => {
    // Ensure we have a name field even if it's empty string
    const leadWithName = {
      ...leadData,
      name: leadData.name || '',
      status: leadData.status || 'new' // Make sure status is always provided
    } as Omit<Lead, "created_at" | "id" | "updated_at">;
    
    const newLead = await createLead(leadWithName);
    // Update React Query cache
    queryClient.setQueryData(['leads', options.projectId, options.status, options.assignedToUser, user?.id], 
      (oldData: Lead[] | undefined) => oldData ? [newLead, ...oldData] : [newLead]);
    return newLead;
  };
  
  const enhancedUpdate = async (leadId: string, leadData: Partial<Lead>) => {
    const updatedLead = await updateLead(leadId, leadData);
    // Update React Query cache
    queryClient.setQueryData(['leads', options.projectId, options.status, options.assignedToUser, user?.id], 
      (oldData: Lead[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(lead => lead.id === leadId ? updatedLead : lead);
      });
    return updatedLead;
  };
  
  const enhancedDelete = async (leadId: string) => {
    await deleteLead(leadId);
    // Update React Query cache
    queryClient.setQueryData(['leads', options.projectId, options.status, options.assignedToUser, user?.id], 
      (oldData: Lead[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(lead => lead.id !== leadId);
      });
  };

  // New function to update approval status
  const updateApprovalStatus = async (leadId: string, isApproved: boolean) => {
    // Update the lead with the approval status in the extra_data field
    const extraData = { approved: isApproved };
    return await enhancedUpdate(leadId, { extra_data: extraData });
  };

  return {
    fetchLeads: () => fetchLeads(options),
    createLead: enhancedCreate,
    updateLead: enhancedUpdate,
    deleteLead: enhancedDelete,
    updateApprovalStatus // Expose the new function
  };
};
