
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useCustomers } from '@/hooks/customers/use-customers';
import { useAdminRepair } from '@/hooks/customers/use-admin-repair';
import { UICustomer } from '@/types/customer';
import CustomerHeader from '@/components/admin/customers/CustomerHeader';
import CustomerStatusPanel from '@/components/admin/customers/CustomerStatusPanel';
import CustomerSearchBar from '@/components/admin/customers/CustomerSearchBar';
import CustomerDebugInfo from '@/components/admin/customers/CustomerDebugInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersSection from '@/components/ui/admin/UsersSection';
import CompaniesSection from '@/components/ui/admin/CompaniesSection';

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
  const [activeTab, setActiveTab] = useState<'users' | 'companies'>('users');

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  // Format customers to match the expected UICustomer type
  const formattedCustomers = customers.map(customer => ({
    ...customer,
    status: customer.status === 'inactive' ? 'inactive' : 'active',
    user_id: customer.user_id || customer.id // Ensure user_id is always set
  })) as UICustomer[];

  // Identify companies by filtering based on proper criteria
  const companies = formattedCustomers.filter(customer => {
    // A record is a company if:
    // 1. It has users array with length > 0
    // 2. It has a valid company_id 
    // 3. It is identified as such from the server
    return (
      (customer.company_id && customer.id === customer.company_id) || // ID matches company_id
      (Array.isArray(customer.users) && customer.users.length > 0) || // Has associated users
      (customer.company_id && !customer.user_id) // Has company_id but no user_id (pure company)
    );
  });

  // A customer is considered a user if it has a user_id
  const users = formattedCustomers.filter(customer => 
    customer.user_id !== undefined && 
    (!customer.company_id || customer.user_id !== customer.company_id)
  );

  console.log('All customers:', customers.length);
  console.log('Filtered users:', users.length);
  console.log('Filtered companies:', companies.length);
  console.log('Companies detailed:', companies);

  return (
    <div className="p-4 space-y-6">
      <CustomerHeader 
        view={view}
        onViewChange={setView}
        onRefresh={fetchCustomers}
        loading={loading}
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

      {/* Tabs for Users and Companies */}
      <Tabs 
        defaultValue="users" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'users' | 'companies')}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-4">
          {/* Only show search if we have data */}
          {!loading && !errorMsg && users.length > 0 && (
            <CustomerSearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
          
          {/* Users content */}
          <UsersSection
            users={users} 
            loading={loading}
            errorMsg={errorMsg}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            refreshUsers={fetchCustomers}
          />
        </TabsContent>
        
        <TabsContent value="companies" className="mt-4">
          {/* Only show search if we have data */}
          {!loading && !errorMsg && companies.length > 0 && (
            <CustomerSearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
          
          {/* Companies content */}
          <CompaniesSection 
            companies={companies}
            loading={loading}
            errorMsg={errorMsg}
            searchTerm={searchTerm}
            view={view}
            onRetry={fetchCustomers}
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
