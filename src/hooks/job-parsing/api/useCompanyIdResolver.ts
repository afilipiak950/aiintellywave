
import { supabase } from '@/integrations/supabase/client';

export const useCompanyIdResolver = () => {
  // Track resolver state to prevent multiple simultaneous calls
  let resolverRunning = false;
  
  const getUserCompanyId = async (userId: string): Promise<string | null> => {
    // Skip if no user ID or if resolver is already running
    if (!userId) {
      console.log('No user ID provided to getUserCompanyId');
      return null;
    }
    
    // Prevent concurrent executions
    if (resolverRunning) {
      console.log('Company ID resolver already running, waiting...');
      return 'guest'; // Use guest mode while waiting
    }
    
    resolverRunning = true;
    
    try {
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
        return 'guest'; // Explicit guest mode for users without company
      }
      
      console.log('User company ID:', data.company_id);
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
