
import { supabase } from '@/integrations/supabase/client';

export const useCompanyIdResolver = () => {
  const getUserCompanyId = async (userId: string): Promise<string | null> => {
    if (!userId) {
      console.log('No user ID provided to getUserCompanyId');
      return null;
    }
    
    try {
      // Get the user's company association
      const { data, error } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching company ID:', error);
        return null;
      }
      
      if (!data) {
        console.log('User company ID: null (no association found)');
        return null;
      }
      
      console.log('User company ID:', data.company_id);
      return data.company_id;
    } catch (error) {
      console.error('Error fetching company ID:', error);
      return null;
    }
  };
  
  return { getUserCompanyId };
};
