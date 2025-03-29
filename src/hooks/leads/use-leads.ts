
import { useEffect, useCallback, useMemo } from 'react';
import { Lead } from '@/types/lead';
import { useLeadState } from './use-lead-state';
import { useLeadFilters } from './use-lead-filters';
import { useLeadQuery } from './use-lead-query';

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

  console.log('useLeads hook initialized with options:', options, 
    'current lead count:', leads.length,
    'filtered lead count:', filteredLeads.length);

  // Force refresh - useful for ensuring leads are loaded after operations
  const refreshLeads = useCallback(async () => {
    console.log('Manually refreshing leads');
    return await fetchLeads();
  }, [fetchLeads]);

  // Automatically fetch leads on mount only (not on every render)
  useEffect(() => {
    console.log('Initial lead fetch effect triggered');
    fetchLeads().then(fetchedLeads => {
      console.log('Initial fetch completed with', fetchedLeads?.length || 0, 'leads');
    });
  }, [fetchLeads]);

  // Return memoized operations to maintain stable references
  const memoizedOperations = useMemo(() => ({
    fetchLeads,
    refreshLeads,
    createLead,
    updateLead,
    deleteLead
  }), [fetchLeads, refreshLeads, createLead, updateLead, deleteLead]);

  return {
    leads: filteredLeads, // Return filtered leads
    allLeads: leads, // Add access to unfiltered leads
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    ...memoizedOperations
  };
};
