
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

export const useLeadOperations = (
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Fetch leads data
  const fetchLeads = useCallback(async (options: { projectId?: string; status?: Lead['status'] } = {}) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('leads')
        .select(`
          *,
          projects:project_id (
            id,
            name,
            company_id,
            companies:company_id (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (options.projectId) {
        query = query.eq('project_id', options.projectId);
      }
      
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const formattedLeads = data.map(lead => ({
          ...lead,
          project_name: lead.projects?.name || 'No Project',
          company_name: lead.projects?.companies?.name || lead.company || 'Unknown Company'
        }));
        
        console.log('Fetched leads:', formattedLeads.length);
        setLeads(formattedLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [setLeads, setLoading]);

  // Create a new lead
  const createLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...lead,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        toast({
          title: 'Success',
          description: 'Lead created successfully',
        });
        fetchLeads();
        return data;
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to create lead. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  }, [fetchLeads]);

  // Update an existing lead
  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        toast({
          title: 'Success',
          description: 'Lead updated successfully',
        });
        fetchLeads();
        return data;
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  }, [fetchLeads]);

  // Delete a lead
  const deleteLead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
      fetchLeads();
      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead. Please try again.',
        variant: 'destructive'
      });
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
