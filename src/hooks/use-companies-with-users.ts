
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { fetchCompanies } from '@/services/companyService';
import { fetchCompanyUsers } from '@/services/companyUserService';
import { CompanyData, UserData } from '@/services/types/customerTypes';

export function useCompaniesWithUsers() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [usersByCompany, setUsersByCompany] = useState<Record<string, UserData[]>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    fetchCompaniesAndUsers();
  }, []);
  
  const fetchCompaniesAndUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      // Fetch companies
      const fetchedCompanies = await fetchCompanies();
      if (!fetchedCompanies) {
        throw new Error('Failed to fetch companies');
      }
      
      setCompanies(fetchedCompanies);
      
      // Fetch users by company
      const companyUsersData = await fetchCompanyUsers();
      
      setUsersByCompany(companyUsersData);
      
    } catch (error: any) {
      console.error('Error fetching companies and users:', error);
      const errorMsg = error.message || 'Failed to load data. Please try again.';
      
      setErrorMsg(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return {
    companies,
    usersByCompany,
    loading,
    errorMsg,
    fetchCompaniesAndUsers
  };
}
