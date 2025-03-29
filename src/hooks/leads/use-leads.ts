
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

  console.log('DEEP DEBUG: useLeads hook initialized with options:', options, 
    'current lead count:', leads.length,
    'filtered lead count:', filteredLeads.length);

  // Force refresh - useful for ensuring leads are loaded after operations
  const refreshLeads = useCallback(async () => {
    console.log('DEEP DEBUG: Manually refreshing leads');
    try {
      setLoading(true);
      const fetchedLeads = await fetchLeads();
      console.log('DEEP DEBUG: Manual refresh completed with', fetchedLeads?.length || 0, 'leads');
      return fetchedLeads;
    } catch (error) {
      console.error('DEEP DEBUG: Error in refreshLeads:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchLeads, setLoading]);

  // Automatically fetch leads on mount
  useEffect(() => {
    console.log('DEEP DEBUG: Initial lead fetch effect triggered');
    fetchLeads().then(fetchedLeads => {
      console.log('DEEP DEBUG: Initial fetch completed with', fetchedLeads?.length || 0, 'leads');
    }).catch(error => {
      console.error('DEEP DEBUG: Error in initial lead fetch:', error);
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
