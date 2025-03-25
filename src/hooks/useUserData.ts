
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export async function fetchUserData(userId: string): Promise<User | null> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Get user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (rolesError) throw rolesError;
    
    // Get company association
    const { data: companyUser, error: companyError } = await supabase
      .from('company_users')
      .select('company_id, role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (companyError) throw companyError;
    
    // Combine roles from user_roles and company_users
    const userRoleValues = userRoles.map(r => r.role as User['roles'][0]);
    
    // Add role from company_users if exists
    if (companyUser?.role) {
      userRoleValues.push(companyUser.role as User['roles'][0]);
    }

    // Try to get auth user data, but handle gracefully if we don't have admin rights
    let email = '';
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (authUser?.user) {
        email = authUser.user.email || '';
      }
    } catch (error) {
      console.error('Unable to fetch admin user data:', error);
      // Fallback: try to get current user email if this is the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId) {
        email = user.email || '';
      }
    }
    
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
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    toast({
      title: "Error",
      description: "Could not retrieve user information.",
      variant: "destructive"
    });
    return null;
  }
}
