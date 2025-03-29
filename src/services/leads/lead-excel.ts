
// This file is now deprecated as we've unified all leads into the main leads table
// It's kept for backwards compatibility but all functionality should use the main lead services

import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

/**
 * Legacy function - maintained for backward compatibility
 * All Excel data is now imported directly into the leads table
 */
export const fetchExcelLeadsData = async () => {
  console.log('fetchExcelLeadsData is deprecated - Excel data is now directly imported to leads table');
  return []; // Return empty array as all Excel data is now in the main leads table
};
