
import { useState, useMemo, useCallback } from 'react';
import { Lead } from '@/types/lead';

/**
 * Hook for managing lead state with memoization to prevent unnecessary re-renders
 */
export const useLeadState = () => {
  const [leads, setLeadsInternal] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeadsInternal] = useState<Lead[]>([]);
  const [loading, setLoadingInternal] = useState(true);
  
  // Use useCallback to stabilize setter functions and prevent unnecessary re-renders
  const setLeads = useCallback((newLeads: React.SetStateAction<Lead[]>) => {
    setLeadsInternal(newLeads);
  }, []);
  
  const setFilteredLeads = useCallback((newFilteredLeads: React.SetStateAction<Lead[]>) => {
    setFilteredLeadsInternal(prevLeads => {
      // If the arrays are equivalent (same length and same IDs in same order), don't update state
      if (typeof newFilteredLeads === 'function') {
        const updatedLeads = newFilteredLeads(prevLeads);
        if (prevLeads.length === updatedLeads.length && 
            prevLeads.every((lead, idx) => lead.id === updatedLeads[idx].id)) {
          return prevLeads;
        }
        return updatedLeads;
      }
      
      if (prevLeads.length === newFilteredLeads.length && 
          prevLeads.every((lead, idx) => lead.id === newFilteredLeads[idx].id)) {
        return prevLeads;
      }
      return newFilteredLeads;
    });
  }, []);
  
  const setLoading = useCallback((newLoading: React.SetStateAction<boolean>) => {
    setLoadingInternal(newLoading);
  }, []);
  
  // Return stable references to state and setters
  return {
    leads,
    setLeads,
    filteredLeads,
    setFilteredLeads,
    loading,
    setLoading
  };
};
