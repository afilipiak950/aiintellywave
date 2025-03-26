
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

// Function to fetch all users from profiles table
export async function fetchUsers(): Promise<any[]> {
  try {
    console.log('Fetching all users data...');
    
    // First get profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    console.log('Profiles data received:', profilesData);
    
    // Instead of trying to call a non-existent RPC function,
    // we'll query the auth.users table directly for emails
    // But since we can't access auth.users directly, we'll just use profiles data
    // and if we have user emails in the future, we can update this
    
    return profilesData.map(profile => ({
      ...profile,
      email: null // We don't have access to emails, so set to null for now
    })) || [];
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
    
    // We're still skipping the company_users query due to RLS recursion issue
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
