
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { UserData } from './types/customerTypes';

// Function to fetch all users from profiles table and join with company_users
export async function fetchUsers(): Promise<any[]> {
  try {
    console.log('Fetching all users data...');
    
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    // Fetch company_users separately
    const { data: companyUsersData, error: companyUsersError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        company_id,
        role,
        is_admin,
        companies:company_id (
          name,
          description,
          contact_email,
          contact_phone,
          city,
          country
        )
      `);
    
    if (companyUsersError) {
      console.error('Error fetching company users:', companyUsersError);
      throw companyUsersError;
    }
    
    // Map company users by user_id for easy lookup
    const companyUserMap: Record<string, any> = {};
    companyUsersData.forEach(cu => {
      companyUserMap[cu.user_id] = {
        company_id: cu.company_id,
        role: cu.role,
        is_admin: cu.is_admin,
        company: cu.companies || {}
      };
    });
    
    // Fetch auth users to get email addresses
    const { data: authUsersData, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      // Continue without auth data rather than failing completely
    }
    
    // Create a map of emails by user id for easier lookup
    const emailMap: Record<string, string> = {};
    if (authUsersData?.users) {
      authUsersData.users.forEach(user => {
        emailMap[user.id] = user.email || '';
      });
    }
    
    // Format the data by combining profiles with company information
    const formattedUsers = profilesData.map(profile => {
      const companyUser = companyUserMap[profile.id] || {};
      const company = companyUser.company || {};
      
      return {
        ...profile,
        email: emailMap[profile.id] || null,
        company_id: companyUser.company_id,
        company_name: company.name,
        company_role: companyUser.role,
        is_admin: companyUser.is_admin,
        contact_email: company.contact_email,
        contact_phone: company.contact_phone,
        city: company.city,
        country: company.country
      };
    });
    
    console.log('Formatted user data:', formattedUsers);
    return formattedUsers || [];
  } catch (error: any) {
    console.error('Error fetching users:', error);
    const errorMsg = error.code 
      ? `Database error (${error.code}): ${error.message}`
      : error.message 
        ? `Error: ${error.message}`
        : 'Failed to load users. Please try again.';
    
    toast({
      title: "Error",
      description: errorMsg,
      variant: "destructive"
    });
    
    return [];
  }
}
