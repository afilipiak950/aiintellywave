
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useCustomers } from '@/hooks/customers/use-customers';
import { useAdminRepair } from '@/hooks/customers/use-admin-repair';
import { Customer as CustomerListType } from '@/types/customer';
import CustomerHeader from '@/components/admin/customers/CustomerHeader';
import CustomerStatusPanel from '@/components/admin/customers/CustomerStatusPanel';
import CustomerSearchBar from '@/components/admin/customers/CustomerSearchBar';
import CustomerContent from '@/components/admin/customers/CustomerContent';
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

  // Format customers to match the expected type in CustomerList
  const formattedCustomers: CustomerListType[] = customers.map(customer => ({
    ...customer,
    status: customer.status === 'inactive' ? 'inactive' : 'active'
  }));

  // Filter out users (entities with user_id) and companies
  const users = formattedCustomers.filter(customer => customer.user_id);
  const companies = formattedCustomers.filter(customer => !customer.user_id);

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
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
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
            users={users} // Change this to pass users instead of filtering again
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
