
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useCustomers } from '@/hooks/customers/use-customers';
import { useAdminRepair } from '@/hooks/customers/use-admin-repair';
import { Customer } from '@/hooks/customers/types';
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

  // Separate users and companies based on whether they represent user or company entities
  // A customer is considered a company if it has no user_id but does have company_id
  // or if it has the same id as its company_id
  const users = formattedCustomers.filter(customer => 
    customer.user_id && (!customer.company_id || customer.user_id !== customer.company_id)
  );

  // A customer is considered a company if it has a company_id that matches its id
  // or if it has no user_id property at all (pure company record)
  const companies = formattedCustomers.filter(customer => 
    (customer.id === customer.company_id) || 
    (!customer.user_id && customer.company_id) ||
    (customer.id && !customer.user_id)
  );

  console.log('All customers:', customers);
  console.log('Filtered users:', users);
  console.log('Filtered companies:', companies);

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
