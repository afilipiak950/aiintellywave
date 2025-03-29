
import { useState, useMemo } from 'react';
import { Lead } from '@/types/lead';

/**
 * Hook for managing lead state with memoization to prevent unnecessary re-renders
 */
export const useLeadState = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Memoize the state setters to maintain stable references
  const memoizedSetters = useMemo(() => ({
    setLeads: (newLeads: React.SetStateAction<Lead[]>) => {
      setLeads(newLeads);
    },
    setFilteredLeads: (newFilteredLeads: React.SetStateAction<Lead[]>) => {
      setFilteredLeads(newFilteredLeads);
    },
    setLoading: (newLoading: React.SetStateAction<boolean>) => {
      setLoading(newLoading);
    }
  }), []);
  
  return {
    leads,
    setLeads: memoizedSetters.setLeads,
    filteredLeads,
    setFilteredLeads: memoizedSetters.setFilteredLeads,
    loading,
    setLoading: memoizedSetters.setLoading
  };
};
