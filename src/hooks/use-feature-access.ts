
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if job parsing feature is enabled for a user
 * @param userId The user ID to check access for
 * @returns Promise that resolves to a boolean indicating if job parsing is enabled
 */
export const isJobParsingEnabled = async (userId: string): Promise<boolean> => {
  try {
    console.log('Checking job parsing access for user:', userId);
    
    if (!userId) {
      console.log('No user ID provided for feature check');
      return false;
    }
    
    // Get company ID first
    const { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching company ID for user:', userError);
      return false;
    }
    
    if (!userData?.company_id) {
      console.log('No company ID found for user:', userId);
      return false;
    }
    
    console.log('Found company ID:', userData.company_id);
    
    // Check if Google Jobs feature is enabled
    const { data, error } = await supabase
      .from('company_features')
      .select('google_jobs_enabled')
      .eq('company_id', userData.company_id)
      .single();
      
    console.log('Google Jobs feature check result:', { data, error });
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No feature record found for company, creating default record with Google Jobs disabled');
        
        try {
          await supabase
            .from('company_features')
            .insert({ 
              company_id: userData.company_id, 
              google_jobs_enabled: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (insertError) {
          console.error('Error creating default feature record:', insertError);
        }
        
        return false;
      }
      
      console.error('Error checking job parsing feature:', error);
      return false;
    }
    
    const isEnabled = data?.google_jobs_enabled === true;
    console.log('Google Jobs feature is enabled:', isEnabled);
    return isEnabled;
  } catch (err) {
    console.error('Error checking job parsing access:', err);
    return false;
  }
};
