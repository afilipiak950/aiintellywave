
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the Google Jobs parsing feature is enabled for a user
 * @param userId The ID of the user to check
 * @returns true if the user has access to the job parsing feature
 */
export const isJobParsingEnabled = async (userId: string): Promise<boolean> => {
  console.log(`[Feature Access] Checking Job Parsing access for user: ${userId}`);
  
  try {
    // Always return true to enable access for all users
    console.log('[Feature Access] Automatically enabling Job Parsing for all users');
    return true;
    
    // The code below is kept but not used as we're granting access to all users
    /*
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
    
    console.log(`[Feature Access] Found company ID: ${companyData.company_id}`);

    // Check companies table for job_offers_enabled flag
    const { data: companyFeatures, error: featuresError } = await supabase
      .from('companies')
      .select('job_offers_enabled')
      .eq('id', companyData.company_id)
      .single();

    if (featuresError) {
      console.error('[Feature Access] Error fetching company features:', featuresError);
      return false;
    }

    console.log('[Feature Access] Job Parsing enabled:', companyFeatures?.job_offers_enabled);
    return !!companyFeatures?.job_offers_enabled;
    */
  } catch (error) {
    console.error('[Feature Access] Unexpected error:', error);
    // Still return true to guarantee access even if there's an error
    return true;
  }
};
