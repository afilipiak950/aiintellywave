
import { supabase } from '@/integrations/supabase/client';

export const useCompanyIdResolver = () => {
  // Make this a module-level variable to prevent race conditions
  let resolverRunning = false;
  
  const getUserCompanyId = async (userId: string): Promise<string | null> => {
    // Skip if no user ID
    if (!userId) {
      console.log('No user ID provided to getUserCompanyId');
      return 'guest'; // Always return guest for missing user ID
    }
    
    // Prevent concurrent executions
    if (resolverRunning) {
      console.log('Company ID resolver already running, returning guest mode while waiting');
      return 'guest'; // Use guest mode while waiting
    }
    
    resolverRunning = true;
    
    try {
      // Cache the result for 5 minutes to prevent repeated DB calls
      const cachedId = sessionStorage.getItem(`company_id_${userId}`);
      const cacheTime = sessionStorage.getItem(`company_id_time_${userId}`);
      
      // Use cached value if it exists and is less than 5 minutes old
      if (cachedId && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        if (cacheAge < 300000) { // 5 minutes
          console.log('Using cached company ID:', cachedId);
          return cachedId;
        }
      }
      
      // Get the user's company association
      const { data, error } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to prevent errors
      
      if (error) {
        console.error('Error fetching company ID:', error);
        return 'guest'; // Use guest mode on error
      }
      
      if (!data || !data.company_id) {
        console.log('User company ID: guest (no association found)');
        
        // Cache the guest value
        sessionStorage.setItem(`company_id_${userId}`, 'guest');
        sessionStorage.setItem(`company_id_time_${userId}`, Date.now().toString());
        
        return 'guest'; // Explicit guest mode for users without company
      }
      
      console.log('User company ID:', data.company_id);
      
      // Cache the result
      sessionStorage.setItem(`company_id_${userId}`, data.company_id);
      sessionStorage.setItem(`company_id_time_${userId}`, Date.now().toString());
      
      return data.company_id;
    } catch (error) {
      console.error('Error fetching company ID:', error);
      return 'guest'; // Use guest mode on exception
    } finally {
      // Always reset the running state
      resolverRunning = false;
    }
  };
  
  return { getUserCompanyId };
};
