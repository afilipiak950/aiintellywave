
import { useCallback } from 'react';
import { Lead } from '@/types/lead';
import { 
  fetchLeadsData, 
  createLeadData, 
  updateLeadData, 
  deleteLeadData 
} from '@/services/lead-service';

export const useLeadOperations = (
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Fetch leads data
  const fetchLeads = useCallback(async (options: { projectId?: string; status?: Lead['status'] } = {}) => {
    try {
      console.log('useLeadOperations: Fetching leads with options:', options);
      setLoading(true);
      
      const leads = await fetchLeadsData(options);
      console.log('useLeadOperations: Fetched leads count:', leads.length);
      
      setLeads(leads);
      return leads;
    } catch (error) {
      console.error('useLeadOperations: Error in fetchLeads:', error);
      setLeads([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLeads, setLoading]);

  // Create a new lead
  const createLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useLeadOperations: Creating lead:', lead);
      const newLead = await createLeadData(lead);
      
      if (newLead) {
        console.log('useLeadOperations: Lead created, refreshing leads');
        await fetchLeads();
      }
      
      return newLead;
    } catch (error) {
      console.error('useLeadOperations: Error in createLead:', error);
      return null;
    }
  }, [fetchLeads]);

  // Update an existing lead
  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      console.log('useLeadOperations: Updating lead:', id, updates);
      const updatedLead = await updateLeadData(id, updates);
      
      if (updatedLead) {
        console.log('useLeadOperations: Lead updated, refreshing leads');
        await fetchLeads();
      }
      
      return updatedLead;
    } catch (error) {
      console.error('useLeadOperations: Error in updateLead:', error);
      return null;
    }
  }, [fetchLeads]);

  // Delete a lead
  const deleteLead = useCallback(async (id: string) => {
    try {
      console.log('useLeadOperations: Deleting lead:', id);
      const success = await deleteLeadData(id);
      
      if (success) {
        console.log('useLeadOperations: Lead deleted, refreshing leads');
        await fetchLeads();
      }
      
      return success;
    } catch (error) {
      console.error('useLeadOperations: Error in deleteLead:', error);
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
