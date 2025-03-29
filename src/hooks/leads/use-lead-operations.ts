
import { useCallback } from 'react';
import { Lead } from '@/types/lead';
import { 
  fetchLeadsData, 
  createLeadData, 
  updateLeadData, 
  deleteLeadData 
} from '@/services/leads';
import { supabase } from '@/integrations/supabase/client';

export const useLeadOperations = (
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Fetch leads data - using unified approach
  const fetchLeads = useCallback(async (options: { projectId?: string; status?: Lead['status']; assignedToUser?: boolean } = {}) => {
    try {
      console.log('DEEP DEBUG: useLeadOperations: Fetching leads with options:', options);
      setLoading(true);
      
      const leads = await fetchLeadsData(options);
      console.log('DEEP DEBUG: useLeadOperations: Fetched leads count:', leads.length);
      
      if (leads.length === 0) {
        console.log('DEEP DEBUG: useLeadOperations: No leads returned from fetchLeadsData');
        
        // Let's check if there are any leads in the database directly
        if (options.assignedToUser) {
          console.log('DEEP DEBUG: Checking for leads assigned to current user directly in DB');
          const { data: userData } = await supabase.auth.getUser();
          console.log('DEEP DEBUG: Current user:', userData?.user?.id);
          
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('id')
            .eq('assigned_to', userData?.user?.id);
            
          if (projectsError) {
            console.error('DEEP DEBUG: Error fetching projects:', projectsError);
          } else {
            console.log('DEEP DEBUG: Projects assigned to user:', projectsData);
            
            const projectIds = projectsData.map(p => p.id);
            if (projectIds.length > 0) {
              const { data: leadsData, error: leadsError } = await supabase
                .from('leads')
                .select('*')
                .in('project_id', projectIds);
                
              console.log('DEEP DEBUG: Direct DB leads check result:', leadsData?.length || 0, leadsError);
            }
          }
        }
      }
      
      setLeads(leads);
      return leads;
    } catch (error) {
      console.error('DEEP DEBUG: useLeadOperations: Error in fetchLeads:', error);
      setLeads([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLeads, setLoading]);

  // Create a new lead
  const createLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('DEEP DEBUG: useLeadOperations: Creating lead:', lead);
      const newLead = await createLeadData(lead);
      
      if (newLead) {
        console.log('DEEP DEBUG: useLeadOperations: Lead created, refreshing leads');
        await fetchLeads();
      }
      
      return newLead;
    } catch (error) {
      console.error('DEEP DEBUG: useLeadOperations: Error in createLead:', error);
      return null;
    }
  }, [fetchLeads]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      console.log('DEEP DEBUG: useLeadOperations: Updating lead:', id, updates);
      const updatedLead = await updateLeadData(id, updates);
      
      if (updatedLead) {
        console.log('DEEP DEBUG: useLeadOperations: Lead updated, refreshing leads');
        await fetchLeads();
      }
      
      return updatedLead;
    } catch (error) {
      console.error('DEEP DEBUG: useLeadOperations: Error in updateLead:', error);
      return null;
    }
  }, [fetchLeads]);

  const deleteLead = useCallback(async (id: string) => {
    try {
      console.log('DEEP DEBUG: useLeadOperations: Deleting lead:', id);
      const success = await deleteLeadData(id);
      
      if (success) {
        console.log('DEEP DEBUG: useLeadOperations: Lead deleted, refreshing leads');
        await fetchLeads();
      }
      
      return success;
    } catch (error) {
      console.error('DEEP DEBUG: useLeadOperations: Error in deleteLead:', error);
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
