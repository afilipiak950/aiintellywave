
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useCustomers } from '@/hooks/customers/use-customers';
import { useAdminRepair } from '@/hooks/customers/use-admin-repair';
import { Customer as CustomerListType } from '@/types/customer';
import CustomerHeader from '@/components/admin/customers/CustomerHeader';
import CustomerStatusPanel from '@/components/admin/customers/CustomerStatusPanel';
import CustomerSearchBar from '@/components/admin/customers/CustomerSearchBar';
import CustomerDebugInfo from '@/components/admin/customers/CustomerDebugInfo';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CustomerCompaniesTab from '@/components/admin/customers/CustomerCompaniesTab';
import CustomerUsersTab from '@/components/admin/customers/CustomerUsersTab';
import { supabase } from '@/integrations/supabase/client';

const Customers = () => {
  const { user } = useAuth();
  const { 
    customers, 
    loading, 
    errorMsg, 
    fetchCustomers, 
    debugInfo, 
    searchTerm, 
    setSearchTerm 
  } = useCustomers();
  
  const {
    isRepairing,
    isRepairingCompanyUsers,
    handleUserRoleRepair,
    handleCompanyUsersRepair
  } = useAdminRepair(fetchCustomers);
  
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<'companies' | 'users'>('companies');
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchCustomers();
      fetchCompaniesAndUsers();
    }
  }, [user]);

  // Function to fetch companies and users separately
  const fetchCompaniesAndUsers = async () => {
    try {
      setLoadingCompanies(true);
      setCompaniesError(null);
      
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);
      
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      setCompaniesError(error.message);
    } finally {
      setLoadingCompanies(false);
    }

    try {
      setLoadingUsers(true);
      setUsersError(null);
      
      // Fetch company users with customer role
      const { data: usersData, error: usersError } = await supabase
        .from('company_users')
        .select(`
          user_id,
          company_id,
          role,
          is_admin,
          email,
          full_name,
          first_name,
          last_name,
          avatar_url,
          last_sign_in_at,
          companies:company_id (
            id,
            name,
            city,
            country
          )
        `);
      
      if (usersError) throw usersError;
      setCompanyUsers(usersData || []);
      
    } catch (error: any) {
      console.error('Error fetching company users:', error);
      setUsersError(error.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Format customers to match the expected type in CustomerList
  const formattedCustomers: CustomerListType[] = customers.map(customer => ({
    ...customer,
    status: customer.status === 'inactive' ? 'inactive' : 'active'
  }));

  return (
    <div className="p-4 space-y-6">
      <CustomerHeader 
        view={view}
        onViewChange={setView}
        onRefresh={() => {
          fetchCustomers();
          fetchCompaniesAndUsers();
        }}
        loading={loading || loadingCompanies || loadingUsers}
      />
      
      {/* Status panel */}
      <CustomerStatusPanel 
        loading={loading}
        errorMsg={errorMsg}
        customerCount={customers.length}
        companyUsersCount={debugInfo?.companyUsersCount || 0}
        onRepairAdmin={handleUserRoleRepair}
        isRepairing={isRepairing}
      />

      {/* Tabs for Companies and Users */}
      <Tabs 
        defaultValue="companies" 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'companies' | 'users')}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          {!loadingCompanies && !companiesError && companies.length > 0 && (
            <CustomerSearchBar 
              searchTerm={companySearchTerm}
              setSearchTerm={setCompanySearchTerm}
            />
          )}
          
          <CustomerCompaniesTab 
            companies={companies}
            loading={loadingCompanies}
            errorMsg={companiesError}
            searchTerm={companySearchTerm}
            view={view}
            onRetry={fetchCompaniesAndUsers}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {!loadingUsers && !usersError && companyUsers.length > 0 && (
            <CustomerSearchBar 
              searchTerm={userSearchTerm}
              setSearchTerm={setUserSearchTerm}
            />
          )}
          
          <CustomerUsersTab 
            users={companyUsers}
            loading={loadingUsers}
            errorMsg={usersError}
            searchTerm={userSearchTerm}
            view={view}
            onRetry={fetchCompaniesAndUsers}
            onRepair={handleCompanyUsersRepair}
            isRepairing={isRepairingCompanyUsers}
          />
        </TabsContent>
      </Tabs>
      
      {/* Debug info at the bottom */}
      <div className="mt-8">
        <details>
          <summary className="cursor-pointer font-medium text-gray-700 p-2 border rounded hover:bg-gray-50">
            Show Debug Information
          </summary>
          <CustomerDebugInfo 
            debugInfo={debugInfo}
            onRepairCompanyUsers={handleCompanyUsersRepair}
            isRepairingCompanyUsers={isRepairingCompanyUsers}
          />
        </details>
      </div>
    </div>
  );
};

export default Customers;
