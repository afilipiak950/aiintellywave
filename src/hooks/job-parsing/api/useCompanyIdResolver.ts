
import { supabase } from '@/integrations/supabase/client';

export const useCompanyIdResolver = () => {
  // Use a ref instead of a module-level variable to prevent issues between instances
  const resolverRunningRef = { current: false };
  
  const getUserCompanyId = async (userId: string): Promise<string | null> => {
    // Skip if no user ID
    if (!userId) {
      console.log('No user ID provided to getUserCompanyId');
      return 'guest-search'; // Always return guest-search for missing user ID
    }
    
    // Prevent concurrent executions
    if (resolverRunningRef.current) {
      console.log('Company ID resolver already running, returning guest mode while waiting');
      return 'guest-search'; // Use guest mode while waiting
    }
    
    resolverRunningRef.current = true;
    
    try {
      // Cache the result for 5 minutes to prevent repeated DB calls
      const cachedId = sessionStorage.getItem(`company_id_${userId}`);
      const cacheTime = sessionStorage.getItem(`company_id_time_${userId}`);
      
      // Use cached value if it exists and is less than 5 minutes old
      if (cachedId && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        if (cacheAge < 300000) { // 5 minutes
          console.log('Using cached company ID:', cachedId);
          resolverRunningRef.current = false;
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
        resolverRunningRef.current = false;
        return 'guest-search'; // Use guest mode on error
      }
      
      if (!data || !data.company_id) {
        console.log('User company ID: guest-search (no association found)');
        
        // Cache the guest value
        sessionStorage.setItem(`company_id_${userId}`, 'guest-search');
        sessionStorage.setItem(`company_id_time_${userId}`, Date.now().toString());
        
        resolverRunningRef.current = false;
        return 'guest-search'; // Explicit guest mode for users without company
      }
      
      console.log('User company ID:', data.company_id);
      
      // Validate that it's a proper UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(data.company_id)) {
        console.error('Invalid company ID format returned from database:', data.company_id);
        resolverRunningRef.current = false;
        return 'guest-search'; // Return guest-search for invalid UUID format
      }
      
      // Cache the result
      sessionStorage.setItem(`company_id_${userId}`, data.company_id);
      sessionStorage.setItem(`company_id_time_${userId}`, Date.now().toString());
      
      resolverRunningRef.current = false;
      return data.company_id;
    } catch (error) {
      console.error('Error fetching company ID:', error);
      resolverRunningRef.current = false;
      return 'guest-search'; // Use guest mode on exception
    }
  };
  
  return { getUserCompanyId };
};
