
import { useState } from 'react';
import { Lead } from '@/types/lead';

/**
 * Hook for managing lead state
 */
export const useLeadState = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  return {
    leads,
    setLeads,
    filteredLeads,
    setFilteredLeads,
    loading,
    setLoading
  };
};
