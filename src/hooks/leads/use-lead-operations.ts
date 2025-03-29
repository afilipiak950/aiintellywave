
import { useCallback } from 'react';
import { Lead } from '@/types/lead';
import { 
  fetchLeadsData, 
  createLeadData, 
  updateLeadData, 
  deleteLeadData 
} from '@/services/leads';

export const useLeadOperations = (
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Fetch leads data - using unified approach
  const fetchLeads = useCallback(async (options: { projectId?: string; status?: Lead['status']; assignedToUser?: boolean } = {}) => {
    try {
      setLoading(true);
      
      const leads = await fetchLeadsData(options);
      
      setLeads(leads);
      return leads;
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      setLeads([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLeads, setLoading]);

  // Create a new lead
  const createLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newLead = await createLeadData(lead);
      
      if (newLead) {
        await fetchLeads();
      }
      
      return newLead;
    } catch (error) {
      console.error('Error in createLead:', error);
      return null;
    }
  }, [fetchLeads]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      const updatedLead = await updateLeadData(id, updates);
      
      if (updatedLead) {
        await fetchLeads();
      }
      
      return updatedLead;
    } catch (error) {
      console.error('Error in updateLead:', error);
      return null;
    }
  }, [fetchLeads]);

  const deleteLead = useCallback(async (id: string) => {
    try {
      const success = await deleteLeadData(id);
      
      if (success) {
        await fetchLeads();
      }
      
      return success;
    } catch (error) {
      console.error('Error in deleteLead:', error);
      return false;
    }
  }, [fetchLeads]);

  return {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  };
};
