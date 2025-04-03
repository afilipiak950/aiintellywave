
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a user's company association
 */
export async function updateCompanyUser(
  userId: string, 
  companyId: string, 
  updates: {
    role?: string;
    is_admin?: boolean;
    is_manager_kpi_enabled?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update the company_users record
    const { error } = await supabase
      .from('company_users')
      .update(updates)
      .eq('user_id', userId)
      .eq('company_id', companyId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error updating company user' };
  }
}

/**
 * Get a company user by user ID and company ID
 */
export async function getCompanyUser(userId: string, companyId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (error) {
      console.error('Error fetching company user:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Error in getCompanyUser:', error);
    return null;
  }
}

/**
 * Get all users in a specific company
 */
export async function getCompanyUsers(companyId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .select(`
        *,
        user_id,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url,
          phone
        )
      `)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }

    // Format the returned data to include profile information
    const formattedUsers = data.map(user => ({
      ...user,
      avatar_url: user.avatar_url || user.profiles?.avatar_url,
      phone: user.phone || user.profiles?.phone,
      // Make sure first_name and last_name are consistent
      first_name: user.first_name || user.profiles?.first_name || '',
      last_name: user.last_name || user.profiles?.last_name || '',
    }));

    return formattedUsers || [];
  } catch (error) {
    console.error('Error in getCompanyUsers:', error);
    return [];
  }
}

/**
 * Add a new user to a company
 */
export async function addUserToCompany(
  companyId: string,
  userData: {
    email: string;
    role: string;
    is_admin: boolean;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    is_manager_kpi_enabled?: boolean;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // First, check if the user exists by email
    const { data: existingUsers, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle();

    if (lookupError) {
      return { success: false, error: `Error looking up user: ${lookupError.message}` };
    }

    let userId = existingUsers?.id;

    // If user doesn't exist in profiles, we'll set user_id to null and it will be linked later
    // when the user signs up with this email

    // Now create the company_user record
    const { data, error } = await supabase
      .from('company_users')
      .insert({
        company_id: companyId,
        user_id: userId,
        email: userData.email,
        role: userData.role,
        is_admin: userData.is_admin,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        full_name: userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        is_manager_kpi_enabled: userData.is_manager_kpi_enabled || false
      })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing user in a company
 */
export async function updateUserInCompany(
  userId: string,
  companyId: string,
  userData: {
    email?: string;
    role?: string;
    is_admin?: boolean;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    is_manager_kpi_enabled?: boolean;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .update({
        email: userData.email,
        role: userData.role,
        is_admin: userData.is_admin,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        full_name: userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        is_manager_kpi_enabled: userData.is_manager_kpi_enabled || false
      })
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data ? data[0] : null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a user from a company
 */
export async function removeUserFromCompany(
  userId: string,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('company_users')
      .delete()
      .eq('user_id', userId)
      .eq('company_id', companyId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
