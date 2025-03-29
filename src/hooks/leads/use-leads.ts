
import { useCallback, useMemo, useEffect, useState } from 'react';
import { Lead } from '@/types/lead';
import { useLeadState } from './use-lead-state';
import { useLeadFilters } from './use-lead-filters';
import { useLeadQuery } from './use-lead-query';
import { useLeadSubscription } from './use-lead-subscription';
import { toast } from '@/hooks/use-toast';

interface UseLeadsOptions {
  projectId?: string;
  status?: Lead['status'];
  assignedToUser?: boolean;
}

export const useLeads = (options: UseLeadsOptions = {}) => {
  const {
    leads,
    setLeads,
    filteredLeads,
    setFilteredLeads,
    loading,
    setLoading
  } = useLeadState();

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Initialize query operations
  const {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  } = useLeadQuery(setLeads, setLoading, options);

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
        await fetchLeads();
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error loading initial lead data:', error);
        toast({
          title: 'Error loading leads',
          description: 'There was a problem loading your leads. Please try again.',
          variant: 'destructive'
        });
      }
    };

    if (!initialLoadComplete) {
      loadInitialData();
    }
  }, [fetchLeads, initialLoadComplete]);

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
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  };
};
