
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
import InviteUserModal from '@/components/ui/user/InviteUserModal';

const Customers = () => {
  const { user } = useAuth();
  const { 
    customers, 
    loading: isLoading, 
    errorMsg: error, 
    refetch: fetchCustomers, 
    debugInfo = undefined, 
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
  const [activeTab, setActiveTab] = useState<'users' | 'companies'>('companies'); // Set companies as default tab
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Get default company for admin users
  useEffect(() => {
    if (user) {
      // For admins, try to get the first company in the list 
      if (user.role === 'admin' && customers.length > 0) {
        // Find the first company that has a valid ID
        const firstCompany = customers.find(c => c.company_id);
        if (firstCompany && firstCompany.company_id) {
          setSelectedCompanyId(firstCompany.company_id);
          console.log("Set default companyId for admin:", firstCompany.company_id);
        }
      } else if (user.companyId) {
        setSelectedCompanyId(user.companyId);
        console.log("Using user.companyId:", user.companyId);
      }
      
      fetchCustomers();
    }
  }, [user]);

  // Update selected company ID whenever customers are loaded
  useEffect(() => {
    if (customers.length > 0 && !selectedCompanyId) {
      // If we don't have a selected company yet, get one from the loaded data
      const firstCompany = customers.find(c => c.company_id);
      if (firstCompany && firstCompany.company_id) {
        setSelectedCompanyId(firstCompany.company_id);
        console.log("Updated company ID from loaded customers:", firstCompany.company_id);
      }
    }
  }, [customers, selectedCompanyId]);

  const formattedCustomers = customers.map(customer => ({
    ...customer,
    status: customer.status === 'inactive' ? 'inactive' : 'active',
    user_id: customer.user_id || customer.id
  })) as UICustomer[];

  const companies = formattedCustomers.filter(customer => {
    const isCompany = (
      (customer.company_id && customer.id === customer.company_id) ||
      (!customer.user_id && customer.company_id) ||
      (customer.company_name && !customer.user_id) ||
      (Array.isArray(customer.users) && customer.users.length > 0) ||
      ((customer.name || '').toLowerCase().includes('gmbh') ||
       (customer.name || '').toLowerCase().includes('inc') ||
       (customer.name || '').toLowerCase().includes('ltd') ||
       (customer.name || '').toLowerCase().includes('limited') ||
       (customer.name || '').toLowerCase().includes('corporation'))
    );

    if (isCompany && customer.company_id) {
      console.log('Identified company:', customer.id, customer.name || customer.company_name, customer.company_id);
    }
    
    return isCompany;
  });

  const users = formattedCustomers.filter(customer => 
    customer.user_id !== undefined && 
    !companies.some(comp => comp.id === customer.id)
  );

  console.log('All customers:', customers.length);
  console.log('Filtered users:', users.length);
  console.log('Filtered companies:', companies.length);
  console.log("Admin page rendering with company ID:", selectedCompanyId);

  return (
    <div className="p-4 space-y-6">
      <CustomerHeader 
        view={view}
        onViewChange={setView}
        onRefresh={fetchCustomers}
        loading={isLoading}
        onInviteUser={() => setIsInviteModalOpen(true)}
        companyId={selectedCompanyId || undefined} // Pass the selected company ID
      />
      
      <CustomerStatusPanel 
        loading={isLoading}
        errorMsg={error}
        customerCount={customers.length}
        companyUsersCount={debugInfo?.companyUsersCount || 0}
        onRepairAdmin={handleUserRoleRepair}
        isRepairing={isRepairing}
      />

      <Tabs 
        defaultValue="companies" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'users' | 'companies')}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="companies">Unternehmen ({companies.length})</TabsTrigger>
          <TabsTrigger value="users">Benutzer ({users.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="companies" className="mt-4">
          {!isLoading && !error && companies.length > 0 && (
            <CustomerSearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
          
          <CompaniesSection 
            companies={companies}
            loading={isLoading}
            errorMsg={error}
            searchTerm={searchTerm}
            view={view}
            onRetry={fetchCustomers}
            onRepair={handleCompanyUsersRepair}
            isRepairing={isRepairingCompanyUsers}
          />
        </TabsContent>
        
        <TabsContent value="users" className="mt-4">
          {!isLoading && !error && users.length > 0 && (
            <CustomerSearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
          
          <UsersSection
            users={users} 
            loading={isLoading}
            errorMsg={error}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            refreshUsers={fetchCustomers}
          />
        </TabsContent>
      </Tabs>
      
      <CustomerDebugInfo 
        debugInfo={debugInfo} 
        onRepairCompanyUsers={handleCompanyUsersRepair}
        isRepairingCompanyUsers={isRepairingCompanyUsers}
      />
      
      <InviteUserModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvited={fetchCustomers}
        companyId={selectedCompanyId || undefined} // Pass the selected company ID
      />
    </div>
  );
};

export default Customers;
