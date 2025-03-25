
import { User, Role } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function fetchUserData(userId: string): Promise<User | null> {
  try {
    console.log("Fetching user data for userId:", userId);
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }
    
    console.log("Profile data retrieved:", profile);
    
    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      throw rolesError;
    }
    
    console.log("User roles retrieved:", userRoles);
    
    // Get company association
    const { data: companyUser, error: companyError } = await supabase
      .from('company_users')
      .select('company_id, role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (companyError) {
      console.error("Error fetching company user:", companyError);
      throw companyError;
    }
    
    console.log("Company user data retrieved:", companyUser);
    
    // Get current user email
    let email = '';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId) {
        email = user.email || '';
        console.log("Retrieved email from current user:", email);
      }
    } catch (error) {
      console.error('Unable to fetch user data:', error);
    }
    
    // If we couldn't get the email from the current user session,
    // we need to try another approach
    if (!email) {
      try {
        // Try to get from auth (might not work without admin rights)
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.user) {
          email = authUser.user.email || '';
          console.log("Retrieved email from admin API:", email);
        }
      } catch (error) {
        console.error('Unable to fetch admin user data:', error);
      }
    }
    
    // Combine roles from user_roles and company_users
    // Format them all to match the Role type
    const userRoleValues: Role[] = userRoles
      ?.map(r => {
        // Make sure we only return values that match our Role type
        const role = r.role as string;
        if (role === 'admin' || role === 'manager' || role === 'employee') {
          return role as Role;
        }
        return 'employee' as Role; // Default to employee if not valid
      }) || [];
    
    // Add role from company_users if exists and is a valid Role type
    if (companyUser?.role) {
      const companyRole = companyUser.role as string;
      if (companyRole === 'admin' || companyRole === 'manager' || companyRole === 'employee') {
        userRoleValues.push(companyRole as Role);
      }
    }
    
    // If no roles found but there's a profile, at least add a basic role
    // This ensures the user has at least one role for authorization checks
    if (userRoleValues.length === 0 && profile) {
      // Default to employee role if no roles are found
      userRoleValues.push('employee');
      console.log("No roles found, defaulting to employee role");
    }

    console.log("Combined user roles:", userRoleValues);
    
    // Construct user object
    const userData: User = {
      id: userId,
      email,
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      avatar: profile?.avatar_url || '',
      isActive: profile?.is_active !== false, // Default to true if null/undefined
      roles: userRoleValues,
      companyId: companyUser?.company_id,
    };
    
    console.log("Constructed userData object:", userData);
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    toast.error("Could not retrieve user information.");
    return null;
  }
}
