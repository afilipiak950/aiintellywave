
import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { useAuth } from '@/context/auth';
import { useLeadFilters } from './use-lead-filters';
import { useLeadOperations } from './use-lead-operations';

interface UseLeadsOptions {
  projectId?: string;
  status?: Lead['status'];
}

export const useLeads = (options: UseLeadsOptions = {}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    applyFilters
  } = useLeadFilters(leads, setFilteredLeads);

  const {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  } = useLeadOperations(setLeads);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchLeads(options);
    }
  }, [user, options.projectId, options.status, fetchLeads]);

  // Apply filters when leads or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [leads, searchTerm, statusFilter, projectFilter, applyFilters]);

  return {
    leads: filteredLeads,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    fetchLeads: () => fetchLeads(options),
    createLead,
    updateLead,
    deleteLead
  };
};
