
import { supabase } from '@/integrations/supabase/client';

export const useCompanyIdResolver = () => {
  // Function to get the user's company ID (if not provided)
  const getUserCompanyId = async (userId: string): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching company ID:', error);
        return null;
      }
      
      return data?.company_id || null;
    } catch (err) {
      console.error('Exception fetching company ID:', err);
      return null;
    }
  };

  return {
    getUserCompanyId
  };
};
