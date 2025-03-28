
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
      console.log('Fetching leads with options:', options);
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
      
      // If projectId is explicitly provided, filter by it
      if (options.projectId) {
        console.log('Filtering by project_id:', options.projectId);
        query = query.eq('project_id', options.projectId);
      }
      
      // If status is provided, filter by it
      if (options.status) {
        console.log('Filtering by status:', options.status);
        query = query.eq('status', options.status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error in Supabase query:', error);
        throw error;
      }
      
      if (data) {
        console.log('Raw data from Supabase:', data);
        
        const formattedLeads = data.map(lead => ({
          ...lead,
          project_name: lead.projects?.name || 'No Project',
          company_name: lead.projects?.companies?.name || lead.company || 'Unknown Company'
        }));
        
        console.log('Formatted leads:', formattedLeads);
        setLeads(formattedLeads);
        return formattedLeads;
      } else {
        console.log('No data returned from Supabase');
        setLeads([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads data. Please try again.',
        variant: 'destructive'
      });
      setLeads([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLeads, setLoading]);

  // Create a new lead
  const createLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating new lead:', lead);
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...lead,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error in Supabase insert:', error);
        throw error;
      }
      
      if (data) {
        console.log('Successfully created lead:', data);
        toast({
          title: 'Success',
          description: 'Lead created successfully',
        });
        fetchLeads();
        return data;
      } else {
        console.log('No data returned after insert');
        return null;
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
      console.log('Updating lead:', id, updates);
      
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error in Supabase update:', error);
        throw error;
      }
      
      if (data) {
        console.log('Successfully updated lead:', data);
        toast({
          title: 'Success',
          description: 'Lead updated successfully',
        });
        fetchLeads();
        return data;
      } else {
        console.log('No data returned after update');
        return null;
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
      console.log('Deleting lead:', id);
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error in Supabase delete:', error);
        throw error;
      }
      
      console.log('Successfully deleted lead:', id);
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
