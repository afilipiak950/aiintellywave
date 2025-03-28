
import { useCallback, useState } from 'react';
import { Lead } from '@/types/lead';

/**
 * Hook for filtering leads data based on search term, status, and project
 */
export const useLeadFilters = (
  leads: Lead[],
  setFilteredLeads: React.Dispatch<React.SetStateAction<Lead[]>>
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Apply filters to leads data
  const applyFilters = useCallback(() => {
    console.log('Applying filters to', leads.length, 'leads with filters:', {
      searchTerm,
      statusFilter,
      projectFilter
    });
    
    let result = [...leads];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(lead => {
        return (
          (lead.name && lead.name.toLowerCase().includes(lowerSearchTerm)) ||
          (lead.company && lead.company.toLowerCase().includes(lowerSearchTerm)) ||
          (lead.email && lead.email.toLowerCase().includes(lowerSearchTerm)) ||
          (lead.position && lead.position.toLowerCase().includes(lowerSearchTerm)) ||
          (lead.notes && lead.notes.toLowerCase().includes(lowerSearchTerm))
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    // Apply project filter (with special handling for 'unassigned')
    if (projectFilter !== 'all') {
      if (projectFilter === 'unassigned') {
        result = result.filter(lead => !lead.project_id);
      } else {
        result = result.filter(lead => lead.project_id === projectFilter);
      }
    }

    console.log('Final filtered results:', result.length, 'leads');
    setFilteredLeads(result);
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
