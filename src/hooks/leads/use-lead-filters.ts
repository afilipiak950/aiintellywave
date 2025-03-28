
import { useState, useCallback } from 'react';
import { Lead, LeadStatus } from '@/types/lead';

export const useLeadFilters = (
  leads: Lead[],
  setFilteredLeads: React.Dispatch<React.SetStateAction<Lead[]>>
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string | 'all'>('all');

  // Apply filters and search term to leads
  const applyFilters = useCallback(() => {
    let results = [...leads];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(lead => lead.status === statusFilter);
    }
    
    // Apply project filter
    if (projectFilter !== 'all') {
      if (projectFilter === 'unassigned') {
        // Filter for leads without a project
        results = results.filter(lead => !lead.project_id);
      } else {
        results = results.filter(lead => lead.project_id === projectFilter);
      }
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        lead =>
          lead.name.toLowerCase().includes(term) ||
          (lead.company && lead.company.toLowerCase().includes(term)) ||
          (lead.email && lead.email.toLowerCase().includes(term)) ||
          (lead.position && lead.position.toLowerCase().includes(term)) ||
          (lead.project_name && lead.project_name.toLowerCase().includes(term)) ||
          (lead.company_name && lead.company_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredLeads(results);
  }, [leads, searchTerm, statusFilter, projectFilter, setFilteredLeads]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    applyFilters
  };
};
