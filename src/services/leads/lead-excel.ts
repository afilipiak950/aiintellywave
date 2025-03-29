
// This file now redirects to the main leads table
// Excel leads are now fully integrated into the main leads system

import { supabase } from '@/integrations/supabase/client';
import { fetchLeadsData } from './lead-fetch';

/**
 * This function now uses the main leads table
 * All Excel data is imported directly into the leads table
 */
export const fetchExcelLeadsData = async (projectId?: string) => {
  console.log('fetchExcelLeadsData is now using the main leads table');
  return fetchLeadsData({ projectId });
};
