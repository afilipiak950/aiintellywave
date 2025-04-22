
import { useEffect, useCallback, useState } from 'react';
import { Lead } from '@/types/lead';
import { useAuth } from '@/context/auth';
import { useLeadOperations } from './use-lead-operations';
import { useQueryClient } from '@tanstack/react-query';

interface UseLeadQueryOptions {
  projectId?: string;
  status?: Lead['status'];
  assignedToUser?: boolean;
  limit?: number;
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
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  } = useLeadOperations(setLeads, setLoading);

  // Calculate backoff time based on retry count (exponential backoff)
  const getBackoffTime = (retry: number): number => {
    // Start with 1 second, then double each retry (1s, 2s, 4s, 8s...)
    const backoff = Math.min(30000, Math.pow(2, retry) * 1000);
    // Add some randomness to prevent thundering herd problem
    return backoff + (Math.random() * 1000);
  };

  // Initial fetch with better error handling and backoff strategy
  const initialFetch = useCallback(async () => {
    if (!user) {
      console.log('No authenticated user, skipping lead fetch');
      return;
    }
    
    // Prevent multiple retries running in parallel
    if (isRetrying) {
      return;
    }
    
    setIsRetrying(true);
    console.log('Initiating lead fetch with options:', options);
    
    try {
      // Add limit parameter to the fetch options to optimize query
      const fetchOptions = {
        ...options,
        limit: options.limit || 100 // Default to 100 if not provided
      };
      
      await fetchLeads(fetchOptions);
      setLastError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('Error in initialFetch:', err);
      setLastError(err instanceof Error ? err : new Error(String(err)));
      
      // Increment retry count for exponential backoff
      setRetryCount(prev => prev + 1);
      
      // Schedule a retry with exponential backoff
      const backoffTime = getBackoffTime(retryCount);
      console.log(`Scheduling retry in ${backoffTime}ms (retry #${retryCount + 1})`);
      
      // Don't automatically retry more than 5 times
      if (retryCount < 5) {
        setTimeout(() => {
          setIsRetrying(false);
          initialFetch();
        }, backoffTime);
      } else {
        // After 5 retries, stop automatic retrying
        setIsRetrying(false);
      }
    } finally {
      if (retryCount >= 5) {
        setIsRetrying(false);
      }
    }
  }, [user, options, fetchLeads, retryCount, isRetrying]);

  // Manual retry function that resets the retry counter
  const manualRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    return initialFetch();
  }, [initialFetch]);

  // Initial fetch effect - runs only when dependencies change
  useEffect(() => {
    // Check if we already have cached data before fetching
    const cachedLeads = queryClient.getQueryData(['leads', options.projectId, options.status, options.assignedToUser, user?.id]);
    
    if (!cachedLeads && !isRetrying) {
      initialFetch();
    }
    
    // Cleanup function to ensure we don't have pending retries when component unmounts
    return () => {
      setIsRetrying(false);
    };
  }, [initialFetch, queryClient, options.projectId, options.status, options.assignedToUser, user?.id, isRetrying]);

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
    updateApprovalStatus,
    manualRetry,
    lastError,
    retryCount,
    isRetrying
  };
};
