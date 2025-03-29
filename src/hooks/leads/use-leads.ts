
import { useEffect, useCallback } from 'react';
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
    setProjectFilter,
    applyFilters
  } = useLeadFilters(leads, setFilteredLeads);

  console.log('useLeads hook initialized with options:', options);

  // Debounced filter application
  const debouncedApplyFilters = useCallback(() => {
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      applyFilters();
    });
  }, [applyFilters]);

  // Apply filters when leads or filter criteria change
  useEffect(() => {
    console.log('Filter effect triggered', {
      leadsCount: leads.length,
      searchTerm,
      statusFilter,
      projectFilter
    });
    
    debouncedApplyFilters();
  }, [leads, searchTerm, statusFilter, projectFilter, debouncedApplyFilters]);

  return {
    leads: filteredLeads, // Return filtered leads instead of all leads
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
