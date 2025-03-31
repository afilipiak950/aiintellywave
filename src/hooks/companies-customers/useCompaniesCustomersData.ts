
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

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
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_admin?: boolean;
  avatar_url?: string;
  last_sign_in_at?: string;
  companies?: {
    id?: string;
    name?: string;
  };
  company_id?: string;
}

export const useCompaniesCustomersData = () => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [companyUsers, setCompanyUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching companies and company users data...");
      
      // Fetch all companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (companiesError) {
        throw companiesError;
      }
      
      // Fetch all company users with company details
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from('company_users')
        .select(`
          id, 
          user_id, 
          company_id, 
          email, 
          full_name, 
          first_name, 
          last_name, 
          role, 
          is_admin,
          avatar_url,
          last_sign_in_at,
          companies(id, name)
        `);
      
      if (companyUsersError) {
        throw companyUsersError;
      }
      
      console.log(`Fetched ${companiesData.length} companies and ${companyUsersData.length} company users`);
      
      setCompanies(companiesData || []);
      setCompanyUsers(companyUsersData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to fetch data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (company.name?.toLowerCase().includes(search)) ||
      (company.description?.toLowerCase().includes(search)) ||
      (company.contact_email?.toLowerCase().includes(search)) ||
      (company.city?.toLowerCase().includes(search)) ||
      (company.country?.toLowerCase().includes(search))
    );
  });
  
  // Filter company users based on search term
  const filteredCompanyUsers = companyUsers.filter(user => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (user.email?.toLowerCase().includes(search)) ||
      (user.full_name?.toLowerCase().includes(search)) ||
      (user.first_name?.toLowerCase().includes(search)) ||
      (user.last_name?.toLowerCase().includes(search)) ||
      (user.role?.toLowerCase().includes(search)) ||
      (user.companies?.name?.toLowerCase().includes(search))
    );
  });
  
  // Get company name for a user
  const getCompanyName = (user: UserData) => {
    if (user.companies && user.companies.name) {
      return user.companies.name;
    }
    
    const company = companies.find(c => c.id === user.company_id);
    return company ? company.name : 'Unknown Company';
  };
  
  // Get user count for a company
  const getUserCount = (companyId: string) => {
    return companyUsers.filter(u => u.company_id === companyId).length;
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  return {
    companies: filteredCompanies,
    companyUsers: filteredCompanyUsers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchData,
    getCompanyName,
    getUserCount,
    totalCompanies: companies.length,
    totalUsers: companyUsers.length
  };
};
