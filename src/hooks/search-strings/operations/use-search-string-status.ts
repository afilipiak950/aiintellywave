
import { supabase } from '@/integrations/supabase/client';
import { SearchStringStatus } from '../search-string-types';

/**
 * Helper function to update search string status with progress
 */
export const updateSearchStringStatus = async (
  id: string, 
  status: SearchStringStatus, 
  progress?: number | null,
  error?: string
) => {
  try {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (progress !== undefined) {
      updateData.progress = progress;
    }
    
    if (error) {
      updateData.error = error;
    }
    
    const { error: updateError } = await supabase
      .from('search_strings')
      .update(updateData)
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating search string status:', updateError);
      throw updateError;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to update search string status:', err);
    return false;
  }
};
