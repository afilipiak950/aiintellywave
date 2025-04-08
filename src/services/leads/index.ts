
// This file centralizes all lead-related service exports
export * from './lead-fetch';
export * from './lead-crud';
export * from './lead-excel';

// Initialize real-time subscriptions for leads table (if not already done)
import { supabase } from '@/integrations/supabase/client';

// Enable real-time for leads table
(async function enableRealtimeForLeads() {
  try {
    // This executes only once when the app starts
    const { error } = await supabase.rpc('supabase_realtime.enable_publication_for_table', {
      table_name: 'leads',
      publication_name: 'supabase_realtime'
    });

    if (error) {
      console.error('Error enabling real-time for leads table:', error);
    } else {
      console.log('Real-time enabled for leads table');
    }
  } catch (err) {
    console.error('Failed to enable real-time:', err);
  }
})();
