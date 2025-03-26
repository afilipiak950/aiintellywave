
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { UserData } from './types/customerTypes';

export async function fetchCompanyUsers(): Promise<Record<string, UserData[]>> {
  try {
    console.log('Fetching company users data...');
    
    // Fetch company users data with the synchronized fields
    const { data: companyUsersData, error: companyUsersError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        company_id,
        role,
        is_admin,
        email,
        full_name,
        first_name,
        last_name,
        avatar_url
      `);
    
    if (companyUsersError) {
      console.error('Error fetching company users:', companyUsersError);
      throw companyUsersError;
    }
    
    console.log('Company users data received:', companyUsersData);
    
    // Now fetch profiles data separately for any additional info
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    // Create a map of profiles by id
    const profilesMap: Record<string, any> = {};
    profilesData.forEach(profile => {
      profilesMap[profile.id] = profile;
    });
    
    // Group users by company_id
    const usersByCompany: Record<string, UserData[]> = {};
    
    companyUsersData.forEach(userRecord => {
      const companyId = userRecord.company_id;
      const profile = profilesMap[userRecord.user_id] || {};
      
      if (!usersByCompany[companyId]) {
        usersByCompany[companyId] = [];
      }
      
      usersByCompany[companyId].push({
        user_id: userRecord.user_id,
        company_id: companyId,
        role: userRecord.role,
        is_admin: userRecord.is_admin,
        email: userRecord.email,
        full_name: userRecord.full_name,
        first_name: userRecord.first_name || profile.first_name,
        last_name: userRecord.last_name || profile.last_name,
        avatar_url: userRecord.avatar_url || profile.avatar_url,
        phone: profile.phone,
        position: profile.position
      });
    });
    
    return usersByCompany;
  } catch (error: any) {
    console.warn(`Error fetching company users data:`, error);
    const errorMsg = error.code 
      ? `Database error (${error.code}): ${error.message}`
      : error.message 
        ? `Error: ${error.message}`
        : 'Failed to load user data. Please try again.';
    
    if (!error.message?.includes('infinite recursion')) {
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
    
    return {};
  }
}
