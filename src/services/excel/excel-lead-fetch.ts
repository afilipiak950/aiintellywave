
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { fetchLeadsData } from '@/services/leads/lead-fetch';

/**
 * This is a wrapper function that simply calls the main fetchLeadsData function.
 * Kept for backward compatibility but encourages use of the unified lead system.
 */
export const fetchProjectExcelLeads = async (projectId: string): Promise<Lead[]> => {
  console.log(`fetchProjectExcelLeads: Using unified lead system for project: ${projectId}`);
  return fetchLeadsData({ projectId }) as Promise<Lead[]>;
};

/**
 * This is a wrapper function that simply calls the main fetchLeadsData function.
 * Kept for backward compatibility but encourages use of the unified lead system.
 */
export const fetchUserProjectsExcelLeads = async (userId: string): Promise<Lead[]> => {
  console.log('fetchUserProjectsExcelLeads: Using unified lead system for user:', userId);
  return fetchLeadsData({ assignedToUser: true }) as Promise<Lead[]>;
};
