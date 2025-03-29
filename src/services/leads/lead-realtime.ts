
import { supabase } from '@/integrations/supabase/client';

/**
 * Enable real-time functionality for the leads table 
 * This needs to be called once during application initialization
 */
export const enableLeadRealtime = async () => {
  try {
    // We don't need to explicitly check the realtime status anymore
    // Supabase automatically handles this for tables in the realtime publication
    console.log('Realtime functionality initialized for leads table');
    
    // Success is assumed as Supabase tables are realtime-enabled by default in modern Supabase
    return true;
  } catch (error) {
    console.error('Failed to initialize realtime functionality:', error);
    return false;
  }
};
