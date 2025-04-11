
import { supabase } from '@/integrations/supabase/client';
import { CompanyData } from './types/customerTypes';
import { toast } from '@/hooks/use-toast';

// Get all companies
export const fetchCompanies = async (): Promise<CompanyData[]> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*');
      
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

// Get company by ID
export const getCompanyById = async (companyId: string): Promise<CompanyData | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching company:', error);
    return null;
  }
};

// Alias for getCompanyById to maintain backwards compatibility
export const fetchCompanyById = getCompanyById;

// Update company details
export const updateCompany = async (companyId: string, companyData: Partial<CompanyData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', companyId);
      
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error updating company:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to update company',
      variant: 'destructive'
    });
    return false;
  }
};

// Create new company
export const createCompany = async (companyData: Partial<CompanyData>): Promise<string | null> => {
  try {
    // Ensure there's a name property which is required by Supabase
    if (!companyData.name) {
      throw new Error('Company name is required');
    }
    
    // Create a new object with just the properties we want to insert
    const dataToInsert = {
      name: companyData.name,
      description: companyData.description,
      contact_email: companyData.contact_email,
      contact_phone: companyData.contact_phone,
      city: companyData.city,
      country: companyData.country,
      website: companyData.website,
      address: companyData.address,
      industry: companyData.industry,
      tags: companyData.tags
    };
    
    const { data, error } = await supabase
      .from('companies')
      .insert(dataToInsert)
      .select('id')
      .single();
      
    if (error) throw error;
    return data.id;
  } catch (error: any) {
    console.error('Error creating company:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to create company',
      variant: 'destructive'
    });
    return null;
  }
};

// Delete company
export const deleteCompany = async (companyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);
      
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting company:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to delete company',
      variant: 'destructive'
    });
    return false;
  }
};
