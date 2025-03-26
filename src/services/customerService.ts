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
    console.log('Fetching company users data...');
    
    console.log('Skipping company_users query due to known RLS recursion issue');
    
    return {};
  } catch (error: any) {
    console.warn(`Error fetching users data:`, error);
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
