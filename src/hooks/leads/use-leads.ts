
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

  console.log('useLeads hook initialized with options:', options);

  // Automatically fetch leads on mount only (not on every render)
  useEffect(() => {
    console.log('Initial lead fetch effect triggered');
    fetchLeads();
  }, [fetchLeads]);

  // Return memoized operations to maintain stable references
  const memoizedOperations = useMemo(() => ({
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  }), [fetchLeads, createLead, updateLead, deleteLead]);

  return {
    leads: filteredLeads, // Return filtered leads
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
