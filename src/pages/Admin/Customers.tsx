
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
  const [activeTab, setActiveTab] = useState<'users' | 'companies'>('companies');

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

  // Identify companies more accurately with improved detection
  const companies = formattedCustomers.filter(customer => {
    // More robust company detection logic
    const isCompany = (
      // Direct indicators:
      // It has a company_id that matches its own id
      (customer.company_id && customer.id === customer.company_id) ||
      // OR it doesn't have a user_id (pure company record)
      (!customer.user_id && customer.company_id) ||
      // OR it has company-specific fields populated
      (customer.company_name && !customer.user_id) ||
      // Inferred indicators:
      // It has associated users
      (Array.isArray(customer.users) && customer.users.length > 0) ||
      // OR check if name is likely a company name (contains common terms)
      ((customer.name || '').toLowerCase().includes('gmbh') ||
       (customer.name || '').toLowerCase().includes('inc') ||
       (customer.name || '').toLowerCase().includes('ltd') ||
       (customer.name || '').toLowerCase().includes('limited') ||
       (customer.name || '').toLowerCase().includes('corporation'))
    );

    if (isCompany) {
      console.log('Identified company:', customer.id, customer.name || customer.company_name);
    }
    
    return isCompany;
  });

  // A customer is considered a user if it has a user_id and is not identified as a company
  const users = formattedCustomers.filter(customer => 
    customer.user_id !== undefined && 
    !companies.some(comp => comp.id === customer.id)
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
        defaultValue="companies" 
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
