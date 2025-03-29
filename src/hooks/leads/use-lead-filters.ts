
import { useCallback, useState, useEffect, useRef } from 'react';
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
  
  // Create a debounce timer ref
  const debounceTimerRef = useRef<number | null>(null);
  
  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('leadSearchTerm', searchTerm);
    localStorage.setItem('leadStatusFilter', statusFilter);
    localStorage.setItem('leadProjectFilter', projectFilter);
  }, [searchTerm, statusFilter, projectFilter]);
  
  // Memoize the applyFilters function with useCallback
  const applyFilters = useCallback(() => {
    if (!leads || !Array.isArray(leads)) {
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
        (lead.phone && lead.phone.toLowerCase().includes(term)) ||
        (lead.position && lead.position.toLowerCase().includes(term)) ||
        (lead.notes && lead.notes.toLowerCase().includes(term))
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
    
    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, projectFilter, setFilteredLeads]);
  
  // Debounced filter application
  const debouncedApplyFilters = useCallback(() => {
    // Cancel any existing timer
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    // Set a new timer
    debounceTimerRef.current = window.setTimeout(() => {
      applyFilters();
      debounceTimerRef.current = null;
    }, 100); // 100ms debounce time for smoother experience
  }, [applyFilters]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    debouncedApplyFilters();
  }, [leads, searchTerm, statusFilter, projectFilter, debouncedApplyFilters]);
  
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
