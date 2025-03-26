
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { UserData } from './types/customerTypes';

// Function to fetch all users from profiles table and join with company_users and auth.users
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
    
    // Fetch company_users separately with joined company data
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
    
    // We can't use auth.admin.listUsers due to permission issues in the client
    // Let's get user data from auth.getUser() for the current user instead
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser();
    
    // Create a map for the current user's auth data if available
    let usersMap: Record<string, any> = {};
    
    if (authUserError) {
      console.error('Error fetching current user:', authUserError);
      // Continue without auth user data, we'll use fallbacks
    } else if (authUserData?.user) {
      // Add current user to the map
      const user = authUserData.user;
      usersMap[user.id] = {
        email: user.email,
        user_metadata: user.user_metadata
      };
      console.log('Current user data retrieved successfully');
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
    
    // Format the data with all available information
    const formattedUsers = profilesData.map(profile => {
      const companyUser = companyUserMap[profile.id] || {};
      const company = companyUser.company || {};
      const authUser = usersMap[profile.id] || {};
      
      // Get user full name from profile or auth user metadata
      let fullName = '';
      if (profile.first_name || profile.last_name) {
        fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      } else if (authUser.user_metadata) {
        // Try to get from auth user metadata
        const metadata = authUser.user_metadata;
        if (metadata?.full_name) {
          fullName = metadata.full_name;
        } else if (metadata?.first_name || metadata?.last_name) {
          fullName = `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim();
        }
      }
      
      return {
        ...profile,
        // Use auth user email as primary, fall back to company contact email
        email: authUser.email || company.contact_email || null,
        full_name: fullName,
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
