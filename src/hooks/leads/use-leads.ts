
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
  const [retryAttempt, setRetryAttempt] = useState(0);
  
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
    checkProjectsDirectly,
    fetchProjectLeadsDirectly // Use the direct project lead fetching function
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

  // Enhanced initial load with more aggressive fallback strategies
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Performing initial lead data load...');
        setFetchError(null);
        
        // First check projects directly to help with debugging
        const projects = await checkProjectsDirectly();
        
        if (projects.length > 0) {
          console.log(`Found ${projects.length} projects, trying direct lead fetch...`);
          
          // Try to fetch leads directly from all found projects
          let allLeads: Lead[] = [];
          let anySuccess = false;
          
          for (const project of projects) {
            try {
              const projectLeads = await fetchProjectLeadsDirectly(project.id);
              if (projectLeads && projectLeads.length > 0) {
                console.log(`Got ${projectLeads.length} leads from project ${project.name}`);
                allLeads = [...allLeads, ...projectLeads];
                anySuccess = true;
              }
            } catch (err) {
              console.warn(`Failed to fetch leads for project ${project.id}:`, err);
              // Continue with other projects
            }
          }
          
          if (anySuccess && allLeads.length > 0) {
            setLeads(allLeads);
            setInitialLoadComplete(true);
            return;
          } else {
            console.log('No leads found from direct project fetching, trying normal fetch...');
          }
        }
        
        // If direct fetch didn't work, try the normal approach
        await fetchLeads();
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error loading initial lead data:', error);
        setFetchError(error instanceof Error ? error : new Error(String(error)));
        
        // Set up for retry on next render
        setRetryAttempt(prev => prev + 1);
      }
    };

    if (!initialLoadComplete && !isRetrying) {
      loadInitialData();
    }
  }, [fetchLeads, initialLoadComplete, isRetrying, checkProjectsDirectly, fetchProjectLeadsDirectly, setLeads, retryAttempt]);

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

  // Add a manual retry function with more aggressive fallback
  const retryFetch = useCallback(async () => {
    setFetchError(null);
    try {
      console.log('Manually retrying lead fetch with fallback strategies...');
      
      // First try direct project access as a more reliable method
      const projects = await checkProjectsDirectly();
      
      if (projects.length > 0) {
        console.log(`Found ${projects.length} projects, attempting direct lead fetch...`);
        
        // Try direct project fetching first
        let allLeads: Lead[] = [];
        let anySuccess = false;
        
        for (const project of projects) {
          try {
            const projectLeads = await fetchProjectLeadsDirectly(project.id);
            if (projectLeads && projectLeads.length > 0) {
              console.log(`Got ${projectLeads.length} leads from project ${project.name}`);
              allLeads = [...allLeads, ...projectLeads];
              anySuccess = true;
            }
          } catch (err) {
            console.warn(`Failed to fetch leads for project ${project.id}:`, err);
            // Continue with other projects
          }
        }
        
        if (anySuccess && allLeads.length > 0) {
          setLeads(allLeads);
          toast({
            title: 'Leads Loaded',
            description: `Successfully loaded ${allLeads.length} leads from your projects.`
          });
          return allLeads;
        } else {
          console.log('No leads found from direct project fetching, trying normal retry...');
        }
      }
      
      // If direct fetch didn't work, fall back to the normal retry
      const results = await manualRetry();
      
      if (results && results.length > 0) {
        toast({
          title: 'Leads Loaded',
          description: `Successfully loaded ${results.length} leads.`
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error in manual retry:', error);
      setFetchError(error instanceof Error ? error : new Error(String(error)));
      
      toast({
        title: 'Error Loading Leads',
        description: 'Could not load your leads. Please try again.',
        variant: 'destructive'
      });
      
      return null;
    }
  }, [manualRetry, checkProjectsDirectly, fetchProjectLeadsDirectly, setLeads]);

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
    fetchLeads: retryFetch, // Use the enhanced retry function
    createLead,
    updateLead,
    deleteLead,
    duplicatesCount,
    fetchError,
    retryCount,
    isRetrying
  };
};
