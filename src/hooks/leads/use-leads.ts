
import { useCallback, useMemo, useEffect, useState } from 'react';
import { Lead } from '@/types/lead';
import { useLeadState } from './use-lead-state';
import { useLeadFilters } from './use-lead-filters';
import { useLeadQuery } from './use-lead-query';
import { useLeadSubscription } from './use-lead-subscription';
import { toast } from '@/hooks/use-toast';
import { useInterval } from '@/hooks/use-interval';

interface UseLeadsOptions {
  projectId?: string;
  status?: Lead['status'];
  assignedToUser?: boolean;
  limit?: number;
  refreshInterval?: number | null;
}

export const useLeads = (options: UseLeadsOptions = {}) => {
  const {
    leads,
    setLeads,
    filteredLeads,
    setFilteredLeads,
    loading,
    setLoading,
    duplicatesCount
  } = useLeadState();

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  // Initialize query operations with the extended options
  const {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    manualRetry,
    lastError,
    retryCount,
    isRetrying,
    checkProjectsDirectly
  } = useLeadQuery(setLeads, setLoading, {
    ...options,
    limit: options.limit || 100 // Default limit to 100
  });

  // Initialize filters with localStorage persistence
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter
  } = useLeadFilters(leads, setFilteredLeads);

  // Initial load of leads - only once
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Performing initial lead data load...');
        setFetchError(null);
        
        // First check projects directly to help with debugging
        await checkProjectsDirectly();
        
        // Then fetch the actual leads
        await fetchLeads();
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error loading initial lead data:', error);
        setFetchError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    if (!initialLoadComplete && !isRetrying) {
      loadInitialData();
    }
  }, [fetchLeads, initialLoadComplete, isRetrying, checkProjectsDirectly]);

  // Set up periodic refresh if requested
  useInterval(() => {
    if (initialLoadComplete && !loading && !isRetrying) {
      console.log('Performing scheduled leads refresh');
      fetchLeads().catch(error => {
        console.error('Error in scheduled refresh:', error);
        // Don't show toast for scheduled refresh errors
        setFetchError(error instanceof Error ? error : new Error(String(error)));
      });
    }
  }, options.refreshInterval || null); // null means don't refresh

  // Handlers for real-time updates
  const handleLeadInsert = useCallback((newLead: Lead) => {
    console.log('Handling lead insert:', newLead);
    setLeads(currentLeads => {
      // Skip if we already have this lead
      if (currentLeads.some(lead => lead.id === newLead.id)) {
        return currentLeads;
      }
      // Add new lead at the beginning of the array
      return [newLead, ...currentLeads];
    });
    
    toast({
      title: 'New lead added',
      description: `${newLead.name} has been added to your leads.`
    });
  }, [setLeads]);

  const handleLeadUpdate = useCallback((updatedLead: Lead) => {
    console.log('Handling lead update:', updatedLead);
    setLeads(currentLeads => 
      currentLeads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    );
  }, [setLeads]);

  const handleLeadDelete = useCallback((deletedLeadId: string) => {
    console.log('Handling lead delete:', deletedLeadId);
    setLeads(currentLeads => 
      currentLeads.filter(lead => lead.id !== deletedLeadId)
    );
    
    toast({
      title: 'Lead deleted',
      description: 'The lead has been removed from your database.'
    });
  }, [setLeads]);

  // Setup real-time subscription
  useLeadSubscription({
    onInsert: handleLeadInsert,
    onUpdate: handleLeadUpdate,
    onDelete: handleLeadDelete,
    projectId: options.projectId,
    assignedToUser: options.assignedToUser
  });

  // Add a manual retry function
  const retryFetch = useCallback(async () => {
    setFetchError(null);
    try {
      // First check projects directly to help with debugging
      await checkProjectsDirectly();
      
      // Then retry the actual fetch
      return await manualRetry();
    } catch (error) {
      console.error('Error in manual retry:', error);
      setFetchError(error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }, [manualRetry, checkProjectsDirectly]);

  // Return values needed for the component
  return {
    leads: filteredLeads,
    allLeads: leads,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    fetchLeads: retryFetch, // Use the retry function instead
    createLead,
    updateLead,
    deleteLead,
    duplicatesCount,
    fetchError,
    retryCount,
    isRetrying
  };
};
