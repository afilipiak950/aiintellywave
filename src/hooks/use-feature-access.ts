
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the Google Jobs parsing feature is enabled for a user
 * @param userId The ID of the user to check
 * @returns true if the user has access to the job parsing feature
 */
export const isJobParsingEnabled = async (userId: string): Promise<boolean> => {
  try {
    // Get user's company from company_users table
    const { data: companyData, error: companyError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userId)
      .single();

    if (companyError) {
      console.error('[Feature Access] Error fetching company:', companyError);
      return false;
    }

    if (!companyData?.company_id) {
      console.error('[Feature Access] No company found for user');
      return false;
    }

    // Check company_features table for Google Jobs feature
    const { data: featureData, error: featureError } = await supabase
      .from('company_features')
      .select('google_jobs_enabled')
      .eq('company_id', companyData.company_id)
      .single();

    if (featureError) {
      // If the error is because no record exists, log it differently
      if (featureError.code === 'PGRST116') {
        console.log('[Feature Access] No feature record found for company');
      } else {
        console.error('[Feature Access] Error fetching features:', featureError);
      }
      return false;
    }

    console.log('[Feature Access] Google Jobs enabled:', featureData?.google_jobs_enabled);
    return !!featureData?.google_jobs_enabled;
  } catch (error) {
    console.error('[Feature Access] Unexpected error:', error);
    return false;
  }
};
