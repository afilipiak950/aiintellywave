
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";

export interface CompanyData {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
}

export interface UserData {
  user_id: string;
  email?: string;
  company_id?: string;
  role?: string;
}

export async function fetchCompanies(): Promise<CompanyData[] | null> {
  try {
    console.log('Fetching companies data...');
    
    // Let's add more logging to see what's happening
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      throw companiesError;
    }
    
    console.log('Companies data received:', companiesData);
    
    // If we got zero results but no error, don't return null
    // Return the empty array so the UI can handle it properly
    return companiesData || [];
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    const errorMsg = error.code 
      ? `Database error (${error.code}): ${error.message}`
      : error.message 
        ? `Error: ${error.message}`
        : 'Failed to load companies. Please try again.';
    
    toast({
      title: "Error",
      description: errorMsg,
      variant: "destructive"
    });
    
    // Return an empty array instead of null
    return [];
  }
}

// Function to fetch all users from profiles table and join with company_users
export async function fetchUsers(): Promise<any[]> {
  try {
    console.log('Fetching all users data...');
    
    // Join profiles with company_users to get company information
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        is_active,
        phone,
        position,
        company_users (
          company_id,
          role,
          is_admin,
          company:companies (
            name,
            description,
            contact_email,
            contact_phone,
            city,
            country
          )
        )
      `);
    
    if (userError) {
      console.error('Error fetching users with company data:', userError);
      throw userError;
    }
    
    console.log('User data with company info received:', userData);
    
    // Format the data to include company information
    const formattedUsers = userData.map(user => {
      const companyUser = user.company_users?.[0] || {};
      const company = companyUser.company || {};
      
      return {
        ...user,
        company_id: companyUser.company_id,
        company_name: company.name,
        company_role: companyUser.role,
        is_admin: companyUser.is_admin,
        email: null, // We don't have direct access to emails
        contact_email: company.contact_email,
        contact_phone: company.contact_phone,
        city: company.city,
        country: company.country
      };
    });
    
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

export async function fetchCompanyUsers(): Promise<Record<string, UserData[]>> {
  try {
    console.log('Fetching company users data...');
    
    // Fetch company users with role information
    const { data: companyUsersData, error: companyUsersError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        company_id,
        role,
        is_admin,
        profiles:profiles (
          first_name,
          last_name,
          avatar_url,
          phone,
          position
        )
      `);
    
    if (companyUsersError) {
      console.error('Error fetching company users:', companyUsersError);
      throw companyUsersError;
    }
    
    console.log('Company users data received:', companyUsersData);
    
    // Group users by company_id
    const usersByCompany: Record<string, UserData[]> = {};
    
    companyUsersData.forEach(userRecord => {
      const companyId = userRecord.company_id;
      const profile = userRecord.profiles || {};
      
      if (!usersByCompany[companyId]) {
        usersByCompany[companyId] = [];
      }
      
      usersByCompany[companyId].push({
        user_id: userRecord.user_id,
        company_id: companyId,
        role: userRecord.role,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        position: profile.position
      });
    });
    
    return usersByCompany;
  } catch (error: any) {
    console.warn(`Error fetching company users data:`, error);
    const errorMsg = error.code 
      ? `Database error (${error.code}): ${error.message}`
      : error.message 
        ? `Error: ${error.message}`
        : 'Failed to load user data. Please try again.';
    
    if (!error.message?.includes('infinite recursion')) {
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
    
    return {};
  }
}
