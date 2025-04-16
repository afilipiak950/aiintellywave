
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { getCompanyUsers } from '@/services/companyUserService';
import { CompanyData, UserData } from '@/services/types/customerTypes';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Fetch companies directly from supabase
      const { data: fetchedCompanies, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error) throw error;
      
      console.log('Companies fetched:', fetchedCompanies?.length || 0);
      setCompanies(fetchedCompanies || []);
      
      // Fetch users by company - updated to use getCompanyUsers
      const companyUsersData: Record<string, UserData[]> = {};
      
      // Get users for each company
      for (const company of fetchedCompanies || []) {
        try {
          const users = await getCompanyUsers(company.id);
          // Ensure each user has user_id property and normalize status to match the required type
          const usersWithId: UserData[] = users.map(user => ({
            ...user,
            user_id: user.id || user.user_id, // Ensure user_id is set
            // Normalize status to match the expected union type
            status: user.status === 'inactive' ? 'inactive' : 'active'
          }));
          companyUsersData[company.id] = usersWithId;
        } catch (err) {
          console.warn(`Failed to fetch users for company ${company.id}:`, err);
          companyUsersData[company.id] = [];
        }
      }
      
      console.log('Company users data fetched:', Object.keys(companyUsersData).length, 'companies');
      
      // Validate that all company IDs in usersByCompany exist in the companies array
      const companyIds = new Set(fetchedCompanies?.map(company => company.id) || []);
      const missingCompanies = Object.keys(companyUsersData).filter(id => !companyIds.has(id));
      
      if (missingCompanies.length > 0) {
        console.warn('Found users assigned to companies that don\'t exist:', missingCompanies);
      }
      
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
