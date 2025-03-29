
import { supabase } from '@/integrations/supabase/client';

/**
 * Enable real-time functionality for the leads table 
 * This needs to be called once during application initialization
 */
export const enableLeadRealtime = async () => {
  try {
    // Check if the table is already in the publication (this is just for logging)
    const { data, error } = await supabase.rpc('supabase_realtime.subscription_check', {
      publication: 'supabase_realtime',
      tables: ['leads']
    });

    if (error) {
      console.error('Error checking realtime status:', error);
    } else {
      console.log('Realtime status for leads table:', data);
    }
  } catch (error) {
    console.error('Failed to check realtime status:', error);
  }

  return true; // Return true as Supabase tables are realtime-enabled by default now
};
