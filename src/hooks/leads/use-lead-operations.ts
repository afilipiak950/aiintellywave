
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
    setLoading(true);
    console.log('Fetching leads with options:', options);
    
    try {
      const leads = await fetchLeadsData(options);
      
      if (Array.isArray(leads)) {
        // Convert any potential JSON string forms of extra_data to proper objects
        const processedLeads = leads.map(lead => ({
          ...lead,
          extra_data: lead.extra_data ? 
            (typeof lead.extra_data === 'string' ? 
              JSON.parse(lead.extra_data) : lead.extra_data) : 
            null
        }));
        
        setLeads(processedLeads);
        return processedLeads;
      }
      
      setLeads([]);
      return [];
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      setLeads([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLeads, setLoading]);

  // Create a new lead - note we don't refetch as we'll get a real-time update
  const createLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newLead = await createLeadData(lead);
      if (!newLead) return null;
      
      // Handle extra_data properly
      return {
        ...newLead,
        extra_data: newLead.extra_data ? 
          (typeof newLead.extra_data === 'string' ? 
            JSON.parse(newLead.extra_data) : newLead.extra_data) : 
          null
      } as Lead;
    } catch (error) {
      console.error('Error in createLead:', error);
      return null;
    }
  }, []);

  // Update a lead - note we don't refetch as we'll get a real-time update
  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      const updatedLead = await updateLeadData(id, updates);
      if (!updatedLead) return null;
      
      // Handle extra_data properly
      return {
        ...updatedLead,
        extra_data: updatedLead.extra_data ? 
          (typeof updatedLead.extra_data === 'string' ? 
            JSON.parse(updatedLead.extra_data) : updatedLead.extra_data) : 
          null
      } as Lead;
    } catch (error) {
      console.error('Error in updateLead:', error);
      return null;
    }
  }, []);

  // Delete a lead - note we don't refetch as we'll get a real-time update
  const deleteLead = useCallback(async (id: string) => {
    try {
      const success = await deleteLeadData(id);
      return success;
    } catch (error) {
      console.error('Error in deleteLead:', error);
      return false;
    }
  }, []);

  return {
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  };
};
