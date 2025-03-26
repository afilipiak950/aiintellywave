
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { CompanyData } from './types/customerTypes';

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
