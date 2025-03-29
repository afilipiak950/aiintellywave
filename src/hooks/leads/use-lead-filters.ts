
import { useCallback, useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/types/lead';

export const useLeadFilters = (
  leads: Lead[],
  setFilteredLeads: React.Dispatch<React.SetStateAction<Lead[]>>
) => {
  // Get filters from localStorage if available
  const getInitialSearchTerm = () => localStorage.getItem('leadSearchTerm') || '';
  const getInitialStatusFilter = () => localStorage.getItem('leadStatusFilter') || 'all';
  const getInitialProjectFilter = () => localStorage.getItem('leadProjectFilter') || 'all';
  
  const [searchTerm, setSearchTerm] = useState<string>(getInitialSearchTerm);
  const [statusFilter, setStatusFilter] = useState<string>(getInitialStatusFilter);
  const [projectFilter, setProjectFilter] = useState<string>(getInitialProjectFilter);
  
  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('leadSearchTerm', searchTerm);
    localStorage.setItem('leadStatusFilter', statusFilter);
    localStorage.setItem('leadProjectFilter', projectFilter);
  }, [searchTerm, statusFilter, projectFilter]);
  
  const setSearchTermWithDebounce = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  const setStatusFilterWithStorage = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);
  
  const setProjectFilterWithStorage = useCallback((project: string) => {
    setProjectFilter(project);
  }, []);
  
  const applyFilters = useCallback(() => {
    console.log('Applying filters to', leads.length, 'leads with filters:', {
      searchTerm,
      statusFilter,
      projectFilter
    });
    
    if (!leads || !Array.isArray(leads)) {
      console.log('Invalid leads data:', leads);
      setFilteredLeads([]);
      return;
    }
    
    let filtered = [...leads];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        (lead.name && lead.name.toLowerCase().includes(term)) ||
        (lead.company && lead.company.toLowerCase().includes(term)) ||
        (lead.email && lead.email.toLowerCase().includes(term)) ||
        (lead.position && lead.position.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter as LeadStatus);
    }
    
    // Apply project filter
    if (projectFilter && projectFilter !== 'all') {
      if (projectFilter === 'unassigned') {
        filtered = filtered.filter(lead => !lead.project_id);
      } else {
        filtered = filtered.filter(lead => lead.project_id === projectFilter);
      }
    }
    
    console.log('Final filtered results:', filtered.length, 'leads');
    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, projectFilter, setFilteredLeads]);
  
  return {
    searchTerm,
    setSearchTerm: setSearchTermWithDebounce,
    statusFilter,
    setStatusFilter: setStatusFilterWithStorage,
    projectFilter,
    setProjectFilter: setProjectFilterWithStorage,
    applyFilters
  };
};
