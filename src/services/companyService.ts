
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { CompanyData } from '../types/customer';

export async function fetchCompanies(): Promise<CompanyData[]> {
  try {
    console.log('Fetching companies data...');
    
    // Query companies table
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        description,
        contact_email,
        contact_phone,
        city,
        country,
        address,
        website,
        logo_url
      `);
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      throw companiesError;
    }
    
    console.log('Companies data received:', companiesData?.length || 0, 'companies');
    
    return companiesData as CompanyData[] || [];
  } catch (error: any) {
    console.error('Error in fetchCompanies:', error);
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
    
    return [];
  }
}

export async function fetchCompanyById(companyId: string): Promise<CompanyData | null> {
  try {
    console.log(`Fetching company data for ID: ${companyId}`);
    
    // Query the company with the specified ID
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        description,
        contact_email,
        contact_phone,
        city,
        country,
        address,
        postal_code,
        website,
        industry,
        logo_url
      `)
      .eq('id', companyId)
      .single();
    
    if (error) {
      console.error(`Error fetching company with ID ${companyId}:`, error);
      throw error;
    }
    
    console.log('Company data received:', data);
    
    return data as CompanyData;
  } catch (error: any) {
    console.error('Error in fetchCompanyById:', error);
    const errorMsg = error.code 
      ? `Database error (${error.code}): ${error.message}`
      : error.message 
        ? `Error: ${error.message}`
        : `Failed to load company. Please try again.`;
    
    // Only show toast for non-404 errors
    if (error.code !== 'PGRST116') {
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
    
    return null;
  }
}
