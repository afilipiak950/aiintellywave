
import { supabase } from '../integrations/supabase/client';
import { toast } from '../hooks/use-toast';
import { UserProfile } from '../context/auth/types';

// Define a type for the user data we expect to receive
type CompanyUserData = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id?: string;
  avatar_url?: string;
  is_admin?: boolean;
  is_manager_kpi_enabled?: boolean;
};

/**
 * Fetch all users associated with a company
 * @param companyId Company ID
 * @returns Array of company users
 */
export const getCompanyUsers = async (companyId: string): Promise<CompanyUserData[]> => {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .select(`
        user_id,
        company_id,
        users:user_id (
          id,
          email,
          first_name,
          last_name,
          role,
          avatar_url,
          is_admin,
          is_manager_kpi_enabled
        )
      `)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the nested data into the expected format
    const users = data.map(item => ({
      id: item.users.id,
      email: item.users.email,
      first_name: item.users.first_name,
      last_name: item.users.last_name,
      role: item.users.role || 'user',
      company_id: item.company_id,
      avatar_url: item.users.avatar_url,
      is_admin: item.users.is_admin || false,
      is_manager_kpi_enabled: item.users.is_manager_kpi_enabled || false
    }));

    return users;
  } catch (error) {
    console.error('Error in getCompanyUsers:', error);
    return [];
  }
};

/**
 * Add a user to a company
 * @param email User's email
 * @param companyId Company ID
 * @returns Success status and user data or error
 */
export const addUserToCompany = async (email: string, companyId: string): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    // First, check if the user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return { 
        success: false, 
        error: `User with email ${email} not found` 
      };
    }

    // Check if user is already associated with this company
    const { data: existingAssociation, error: associationError } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userData.id)
      .eq('company_id', companyId)
      .single();

    if (existingAssociation) {
      return { 
        success: false, 
        error: 'User is already associated with this company' 
      };
    }

    // Create the association
    const { error } = await supabase
      .from('company_users')
      .insert([
        { user_id: userData.id, company_id: companyId }
      ]);

    if (error) {
      console.error('Error adding user to company:', error);
      return { 
        success: false, 
        error: `Failed to add user: ${error.message}` 
      };
    }

    toast({
      title: 'User added',
      description: `User ${email} has been added to the company.`
    });

    return {
      success: true,
      user: userData
    };
  } catch (error) {
    console.error('Error in addUserToCompany:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred' 
    };
  }
};

/**
 * Remove a user from a company
 * @param userId User ID
 * @param companyId Company ID
 */
export const removeUserFromCompany = async (userId: string, companyId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('company_users')
      .delete()
      .eq('user_id', userId)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error removing user from company:', error);
      return { 
        success: false, 
        error: `Failed to remove user: ${error.message}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in removeUserFromCompany:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred' 
    };
  }
};
