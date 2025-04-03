
import { supabase } from '../integrations/supabase/client';
import { toast } from '../hooks/use-toast';
import { UserProfile } from '../context/auth/types';

// Define a type for the user data we expect to receive
type CompanyUserData = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
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
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the data into the expected format
    const users = data.map(item => ({
      id: item.user_id,
      email: item.email || '',
      first_name: item.first_name || null,
      last_name: item.last_name || null,
      role: item.role || 'user',
      company_id: item.company_id,
      avatar_url: item.avatar_url || null,
      is_admin: item.is_admin || false,
      is_manager_kpi_enabled: item.is_manager_kpi_enabled || false
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
    // First, check if the user exists in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('email', email)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" error, which we handle below
      console.error('Error checking if user exists:', profileError);
      return { 
        success: false, 
        error: `Database error: ${profileError.message}` 
      };
    }

    // If no profile found
    let userId = profileData?.id;
    let firstName = profileData?.first_name;
    let lastName = profileData?.last_name;
    
    if (!userId) {
      return { 
        success: false, 
        error: `User with email ${email} not found. Please ensure the user is registered.` 
      };
    }

    // Check if user is already associated with this company
    const { data: existingAssociation, error: associationError } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (associationError && associationError.code !== 'PGRST116') {
      console.error('Error checking user association:', associationError);
      return {
        success: false,
        error: `Database error: ${associationError.message}`
      };
    }

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
        { 
          user_id: userId, 
          company_id: companyId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: 'customer',
          is_admin: false,
          is_manager_kpi_enabled: false
        }
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
      user: {
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName
      }
    };
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Error in removeUserFromCompany:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred' 
    };
  }
};
