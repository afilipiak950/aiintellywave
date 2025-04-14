
import { supabase } from '@/integrations/supabase/client';
import { SearchStringStatus } from '../search-string-types';

/**
 * Cancel an in-progress search string generation
 */
export const cancelSearchString = async (id: string) => {
  try {
    const { error } = await supabase
      .from('search_strings')
      .update({ 
        status: 'canceled' as SearchStringStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error canceling search string:', error);
    return false;
  }
};
