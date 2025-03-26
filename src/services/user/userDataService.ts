
import { supabase } from '../../integrations/supabase/client';
import { toast } from "../../hooks/use-toast";
import { UserData } from '../types/customerTypes';

// Function to fetch all users from profiles table and join with company_users and auth.users
export async function fetchUsers(): Promise<UserData[]> {
  try {
    console.log('Fetching all users data...');
    
    // Get authenticated user to access their email
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Error getting current user:', authError);
    }
    
    // Use a different approach - get company_users first
    const { data: companyUsersData, error: companyUsersError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        company_id,
        role,
        is_admin,
        companies (
          name,
          description,
          contact_email,
          contact_phone,
          city,
          country
        )
      `);
    
    if (companyUsersError) {
      console.error('Error fetching company users data:', companyUsersError);
      throw companyUsersError;
    }
    
    // Then get profiles separately
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error fetching profiles data:', profilesError);
      throw profilesError;
    }
    
    console.log('Company users data:', companyUsersData);
    console.log('Profiles data:', profilesData);
    
    // Create a map of profiles by id for easy lookup
    const profilesMap: Record<string, any> = {};
    profilesData.forEach((profile: any) => {
      profilesMap[profile.id] = profile;
    });
    
    // Separately fetch auth user data (emails) using admin API
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    // Create an email map for faster lookups
    let emailMap: Record<string, string> = {};
    
    if (authUsers && authUsers.users) {
      // Properly iterate over users array with type safety
      authUsers.users.forEach((user: any) => {
        if (user && user.id && user.email) {
          emailMap[user.id] = user.email;
        }
      });
    } else if (authUsersError) {
      console.warn('Unable to fetch auth users directly:', authUsersError);
      // Fall back to getting each user's email individually
      for (const user of companyUsersData) {
        const { data: userAuth } = await supabase.auth.admin.getUserById(user.user_id);
        if (userAuth?.user && userAuth.user.email) {
          emailMap[user.user_id] = userAuth.user.email;
        }
      }
    }
    
    // Format data for UI use by joining the data manually
    const formattedUsers = companyUsersData.map((companyUser: any) => {
      // Get the profile for this user
      const profile = profilesMap[companyUser.user_id] || {};
      // Get the company data
      const company = companyUser.companies || {};
      
      // Special case for admin account
      const isCurrentUser = companyUser.user_id === authData?.user?.id;
      // Get email from our map or fall back to current user
      const email = emailMap[companyUser.user_id] || (isCurrentUser ? authData?.user?.email : '');
      
      // Get user full name from profile
      let fullName = '';
      if (profile) {
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        fullName = `${firstName} ${lastName}`.trim();
      }
      
      return {
        id: companyUser.user_id,
        email: email || company.contact_email || '',
        full_name: fullName || 'Unnamed User',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        company_id: companyUser.company_id,
        company_name: company.name || '',
        company_role: companyUser.role,
        is_admin: companyUser.is_admin,
        avatar_url: profile.avatar_url || '',
        phone: profile.phone || '',
        position: profile.position || '',
        is_active: typeof profile.is_active === 'boolean' ? profile.is_active : true,
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        city: company.city || '',
        country: company.country || ''
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
