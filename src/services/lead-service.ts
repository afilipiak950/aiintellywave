
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

/**
 * Fetches leads from the database with optional filtering
 */
export const fetchLeadsData = async (options: { projectId?: string; status?: Lead['status'] } = {}) => {
  try {
    console.log('Lead service: Fetching leads with options:', options);
    
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
    
    // Apply filters if provided
    if (options.projectId) {
      console.log('Lead service: Filtering by project_id:', options.projectId);
      query = query.eq('project_id', options.projectId);
    }
    
    if (options.status) {
      console.log('Lead service: Filtering by status:', options.status);
      query = query.eq('status', options.status);
    }
    
    console.log('Lead service: Executing Supabase query');
    const { data, error } = await query;
    
    if (error) {
      console.error('Lead service: Error in Supabase query:', error);
      throw error;
    }
    
    if (data) {
      console.log('Lead service: Raw data from Supabase, count:', data.length);
      
      const formattedLeads = data.map(lead => ({
        ...lead,
        project_name: lead.projects?.name || 'No Project',
        company_name: lead.projects?.companies?.name || lead.company || 'Unknown Company'
      }));
      
      console.log('Lead service: Formatted leads count:', formattedLeads.length);
      return formattedLeads;
    } else {
      console.log('Lead service: No data returned from Supabase');
      return [];
    }
  } catch (error) {
    console.error('Lead service: Error fetching leads:', error);
    toast({
      title: 'Error',
      description: 'Failed to load leads data. Please try again.',
      variant: 'destructive'
    });
    return [];
  }
};

/**
 * Creates a new lead in the database
 */
export const createLeadData = async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    console.log('Lead service: Creating new lead:', lead);
    
    // Ensure lead status is a valid LeadStatus type
    if (typeof lead.status === 'string' && 
        !['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].includes(lead.status as string)) {
      throw new Error(`Invalid lead status: ${lead.status}`);
    }
    
    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...lead,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Lead service: Error in Supabase insert:', error);
      throw error;
    }
    
    if (data) {
      console.log('Lead service: Successfully created lead:', data);
      toast({
        title: 'Success',
        description: 'Lead created successfully',
      });
      return data;
    } else {
      console.log('Lead service: No data returned after insert');
      return null;
    }
  } catch (error) {
    console.error('Lead service: Error creating lead:', error);
    toast({
      title: 'Error',
      description: 'Failed to create lead. Please try again.',
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Updates an existing lead in the database
 */
export const updateLeadData = async (id: string, updates: Partial<Lead>) => {
  try {
    console.log('Lead service: Updating lead:', id, updates);
    
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
      console.error('Lead service: Error in Supabase update:', error);
      throw error;
    }
    
    if (data) {
      console.log('Lead service: Successfully updated lead:', data);
      toast({
        title: 'Success',
        description: 'Lead updated successfully',
      });
      return data;
    } else {
      console.log('Lead service: No data returned after update');
      return null;
    }
  } catch (error) {
    console.error('Lead service: Error updating lead:', error);
    toast({
      title: 'Error',
      description: 'Failed to update lead. Please try again.',
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Deletes a lead from the database
 */
export const deleteLeadData = async (id: string) => {
  try {
    console.log('Lead service: Deleting lead:', id);
    
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Lead service: Error in Supabase delete:', error);
      throw error;
    }
    
    console.log('Lead service: Successfully deleted lead:', id);
    toast({
      title: 'Success',
      description: 'Lead deleted successfully',
    });
    return true;
  } catch (error) {
    console.error('Lead service: Error deleting lead:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete lead. Please try again.',
      variant: 'destructive'
    });
    return false;
  }
};
