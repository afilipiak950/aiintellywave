
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
    // Now using the proper foreign key relationship between company_users and auth.users
    const { data: userData, error: userError } = await supabase
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
        ),
        users:user_id (
          email
        ),
        profiles:user_id (
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
    
    // Format data for UI use
    const formattedUsers = userData.map(record => {
      // Handle potential undefined objects with default empty objects
      const profile = record.profiles || {};
      const company = record.companies || {};
      const userAuth = record.users || {};
      
      // Special case for admin account
      const isCurrentUser = record.user_id === authData?.user?.id;
      // Use optional chaining for safer property access
      const authEmail = isCurrentUser ? authData?.user?.email : undefined;
      
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
        email: userAuth && 'email' in userAuth ? userAuth.email : 
               authEmail || 
               (company && 'contact_email' in company ? company.contact_email : null),
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
