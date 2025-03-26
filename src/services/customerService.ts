
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
}

export async function fetchCompanies(): Promise<CompanyData[] | null> {
  try {
    console.log('Fetching companies data...');
    
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, description, contact_email, contact_phone, city, country');
    
    if (companiesError) {
      console.error('Error details:', companiesError);
      throw companiesError;
    }
    
    console.log('Companies data received:', companiesData);
    return companiesData;
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
    
    return null;
  }
}

export async function fetchCompanyUsers(): Promise<Record<string, UserData[]>> {
  try {
    const { data: allCompanyUsers, error: usersError } = await supabase
      .from('company_users')
      .select('company_id, user_id');
      
    if (usersError) {
      console.warn('Error fetching users data:', usersError);
      return {};
    }
    
    // Group users by company_id
    const usersByCompany: Record<string, UserData[]> = {};
    
    if (allCompanyUsers) {
      allCompanyUsers.forEach(cu => {
        if (!usersByCompany[cu.company_id]) {
          usersByCompany[cu.company_id] = [];
        }
        
        usersByCompany[cu.company_id].push({
          user_id: cu.user_id,
          email: cu.user_id // Using user_id as email since we don't have actual email
        });
      });
    }
    
    return usersByCompany;
  } catch (error: any) {
    console.warn(`Error fetching users data:`, error);
    return {};
  }
}
