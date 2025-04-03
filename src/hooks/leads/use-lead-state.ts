
import { useState, useCallback, useMemo } from 'react';
import { Lead } from '@/types/lead';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for managing lead state with memoization to prevent unnecessary re-renders
 */
export const useLeadState = () => {
  const [leads, setLeadsInternal] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeadsInternal] = useState<Lead[]>([]);
  const [loading, setLoadingInternal] = useState(true);
  const [duplicatesCount, setDuplicatesCount] = useState(0);
  const queryClient = useQueryClient();
  
  // Use useCallback to stabilize setter functions and prevent unnecessary re-renders
  const setLeads = useCallback((newLeads: React.SetStateAction<Lead[]>) => {
    setLeadsInternal(prevLeads => {
      const updatedLeads = typeof newLeads === 'function' ? newLeads(prevLeads) : newLeads;
      
      // Filter out duplicates based on email
      const uniqueLeadsMap = new Map<string, Lead>();
      let duplicates = 0;
      
      updatedLeads.forEach(lead => {
        const key = lead.email?.toLowerCase() || '';
        
        if (key && key.length > 0) {
          // If we have a valid email to use as key
          if (!uniqueLeadsMap.has(key)) {
            uniqueLeadsMap.set(key, lead);
          } else {
            // It's a duplicate - we could keep the newest one instead
            const existingLead = uniqueLeadsMap.get(key)!;
            const existingDate = new Date(existingLead.created_at);
            const newDate = new Date(lead.created_at);
            
            // If this lead is newer, replace the existing one
            if (newDate > existingDate) {
              uniqueLeadsMap.set(key, lead);
            }
            
            duplicates++;
          }
        } else {
          // For leads without email, use id as key (these are always unique)
          uniqueLeadsMap.set(lead.id, lead);
        }
      });
      
      setDuplicatesCount(duplicates);
      
      // Convert map values back to array
      const uniqueLeads = Array.from(uniqueLeadsMap.values());
      
      // Update the react-query cache with our filtered results
      queryClient.setQueryData(['leads', 'filtered'], uniqueLeads);
      
      return uniqueLeads;
    });
  }, [queryClient]);
  
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
      
      // Update the filtered leads in react-query cache
      queryClient.setQueryData(['leads', 'filtered'], newFilteredLeads);
      
      return newFilteredLeads;
    });
  }, [queryClient]);
  
  const setLoading = useCallback((newLoading: React.SetStateAction<boolean>) => {
    setLoadingInternal(newLoading);
  }, []);
  
  // Memoized leads to prevent unnecessary re-renders
  const memoizedLeads = useMemo(() => leads, [leads]);
  const memoizedFilteredLeads = useMemo(() => filteredLeads, [filteredLeads]);
  
  // Return stable references to state and setters
  return {
    leads: memoizedLeads,
    setLeads,
    filteredLeads: memoizedFilteredLeads,
    setFilteredLeads,
    loading,
    setLoading,
    duplicatesCount
  };
};
