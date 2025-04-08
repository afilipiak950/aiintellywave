
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
      // Always fetch all leads initially, don't filter by project at the database level
      // This ensures we see leads from all projects in the lead database
      const fetchOptions = { ...options };
      if (options.assignedToUser === true) {
        // When on the lead database page, we want to see all leads from all projects
        delete fetchOptions.projectId;
      }
      
      await fetchLeads(fetchOptions);
    } catch (err) {
      console.error('Error in initialFetch:', err);
    }
  }, [user, options.status, options.assignedToUser, fetchLeads]);

  // Initial fetch effect - runs only when dependencies change
  useEffect(() => {
    // Check if we already have cached data before fetching
    const cacheKey = ['leads', options.status, options.assignedToUser, user?.id];
    const cachedLeads = queryClient.getQueryData(cacheKey);
    
    if (!cachedLeads) {
      initialFetch();
    }
  }, [initialFetch, queryClient, options.status, options.assignedToUser, user?.id]);

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
    const cacheKey = ['leads', options.status, options.assignedToUser, user?.id];
    queryClient.setQueryData(cacheKey, 
      (oldData: Lead[] | undefined) => oldData ? [newLead, ...oldData] : [newLead]);
    return newLead;
  };
  
  const enhancedUpdate = async (leadId: string, leadData: Partial<Lead>) => {
    const updatedLead = await updateLead(leadId, leadData);
    // Update React Query cache
    const cacheKey = ['leads', options.status, options.assignedToUser, user?.id];
    queryClient.setQueryData(cacheKey, 
      (oldData: Lead[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(lead => lead.id === leadId ? updatedLead : lead);
      });
    return updatedLead;
  };
  
  const enhancedDelete = async (leadId: string) => {
    await deleteLead(leadId);
    // Update React Query cache
    const cacheKey = ['leads', options.status, options.assignedToUser, user?.id];
    queryClient.setQueryData(cacheKey, 
      (oldData: Lead[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(lead => lead.id !== leadId);
      });
  };

  return {
    fetchLeads: () => fetchLeads(options),
    createLead: enhancedCreate,
    updateLead: enhancedUpdate,
    deleteLead: enhancedDelete
  };
};
