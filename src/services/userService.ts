
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { UserData } from './types/customerTypes';

// Function to fetch all users from profiles table and join with company_users and auth.users
export async function fetchUsers(): Promise<any[]> {
  try {
    console.log('Fetching all users data...');
    
    // Get authenticated user to access their email
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Error getting current user:', authError);
    }
    
    // Create a join query that gets profiles and company_users in one go
    // Using a different approach to get the relationship working
    const { data: userData, error: userError } = await supabase
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
        ),
        profiles!user_id (
          id,
          first_name,
          last_name,
          avatar_url,
          phone,
          position,
          is_active
        )
      `);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      throw userError;
    }
    
    console.log('User data with join:', userData);
    
    // Separately fetch user emails since we're having issues with the direct join
    const userIds = userData.map(user => user.user_id);
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    // Create an email map for faster lookups
    let emailMap: Record<string, string> = {};
    
    if (authUsers && authUsers.users) {
      // Fix type issues by explicitly extracting email from each user
      authUsers.users.forEach((user: any) => {
        if (user && user.id && user.email) {
          emailMap[user.id] = user.email;
        }
      });
    } else if (authUsersError) {
      console.warn('Unable to fetch auth users directly:', authUsersError);
      // Fall back to getting each user's email individually
      for (const user of userData) {
        const { data: userAuth } = await supabase.auth.admin.getUserById(user.user_id);
        if (userAuth?.user && userAuth.user.email) {
          emailMap[user.user_id] = userAuth.user.email;
        }
      }
    }
    
    // Format data for UI use
    const formattedUsers = userData.map(record => {
      // Handle potential undefined objects with default empty objects
      const profile = record.profiles || {};
      const company = record.companies || {};
      
      // Special case for admin account
      const isCurrentUser = record.user_id === authData?.user?.id;
      // Get email from our map or fall back to current user
      const email = emailMap[record.user_id] || (isCurrentUser ? authData?.user?.email : undefined);
      
      // Get user full name from profile
      let fullName = '';
      if (profile && typeof profile === 'object') {
        // Safely check if properties exist on the profile object
        const firstName = 'first_name' in profile ? profile.first_name : '';
        const lastName = 'last_name' in profile ? profile.last_name : '';
        fullName = `${firstName || ''} ${lastName || ''}`.trim();
      }
      
      return {
        id: record.user_id,
        // Email fallbacks with type-safe checks
        email: email || (company && 'contact_email' in company ? company.contact_email : null),
        full_name: fullName || 'Unnamed User',
        first_name: profile && 'first_name' in profile ? profile.first_name : undefined,
        last_name: profile && 'last_name' in profile ? profile.last_name : undefined,
        company_id: record.company_id,
        company_name: company && 'name' in company ? company.name : undefined,
        company_role: record.role,
        is_admin: record.is_admin,
        avatar_url: profile && 'avatar_url' in profile ? profile.avatar_url : undefined,
        phone: profile && 'phone' in profile ? profile.phone : undefined,
        position: profile && 'position' in profile ? profile.position : undefined,
        is_active: profile && 'is_active' in profile ? profile.is_active : true,
        contact_email: company && 'contact_email' in company ? company.contact_email : undefined,
        contact_phone: company && 'contact_phone' in company ? company.contact_phone : undefined,
        city: company && 'city' in company ? company.city : undefined,
        country: company && 'country' in company ? company.country : undefined
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
