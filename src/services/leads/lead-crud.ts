
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

/**
 * Creates a new lead in the database
 */
export const createLeadData = async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    console.log('Lead service: Creating new lead:', lead);
    
    // Ensure lead has required fields
    if (!lead.name) {
      throw new Error('Lead name is required');
    }
    
    // Set default status if not provided
    if (!lead.status) {
      lead.status = 'new';
    }
    
    // Add timestamps for consistency
    const now = new Date().toISOString();
    
    // Add more detailed logging to track the insert operation
    console.log('Lead service: Sending insert request to Supabase');
    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...lead,
        created_at: now,
        updated_at: now
      })
      .select();
    
    if (error) {
      console.error('Lead service: Error in Supabase insert:', error);
      toast({
        title: 'Error',
        description: `Failed to create lead: ${error.message}`,
        variant: 'destructive'
      });
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Lead service: Successfully created lead:', data[0]);
      toast({
        title: 'Success',
        description: 'Lead created successfully',
      });
      return data[0];
    } else {
      console.log('Lead service: No data returned after insert');
      toast({
        title: 'Warning',
        description: 'Lead may have been created but no data was returned',
      });
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
