
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

  // Initialize operations with loading state
  const {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  } = useLeadOperations(setLeads, setLoading);

  // Initialize filters
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    applyFilters
  } = useLeadFilters(leads, setFilteredLeads);

  // Initial fetch
  useEffect(() => {
    console.log('useLeads effect triggered', {
      user: !!user,
      projectId: options.projectId,
      status: options.status
    });
    
    if (user) {
      fetchLeads(options)
        .then(result => {
          console.log('Fetch leads completed, got:', result?.length || 0, 'leads');
        })
        .catch(err => {
          console.error('Error in fetchLeads effect:', err);
        });
    }
  }, [user, options.projectId, options.status, fetchLeads]);

  // Apply filters when leads or filter criteria change
  useEffect(() => {
    console.log('Filter effect triggered', {
      leadsCount: leads.length,
      searchTerm,
      statusFilter,
      projectFilter
    });
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
