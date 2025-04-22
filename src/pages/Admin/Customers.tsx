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
import InviteUserModal from '@/components/ui/user/InviteUserModal';
import { useAuthUsers } from '@/hooks/use-auth-users';
import { toast } from '@/hooks/use-toast';

const Customers = () => {
  const { user } = useAuth();
  
  const { 
    users: authUsers, 
    loading: authUsersLoading, 
    errorMsg: authUsersError, 
    refreshUsers: refreshAuthUsers,
    searchTerm: authSearchTerm,
    setSearchTerm: setAuthSearchTerm 
  } = useAuthUsers();
  
  const { 
    customers, 
    loading: isLoading, 
    errorMsg: error, 
    refetch: fetchCustomers, 
    debugInfo = {
      totalUsersCount: 0,
      filteredUsersCount: 0,
      source: 'profiles',
      companyUsersCount: 0,
      companyUsersDiagnostics: {
        status: 'info',
        totalCount: 0
      },
      companyUsersRepair: {
        status: 'info',
        message: 'No repair needed'
      }
    }, 
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
  const [activeTab, setActiveTab] = useState<'users'>('users');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Auth Users Status:', { loading: authUsersLoading, error: authUsersError, count: authUsers.length });
    console.log('Customer Users Status:', { loading: isLoading, error, count: customers.length, debugInfo });
  }, [authUsers, authUsersLoading, authUsersError, customers, isLoading, error, debugInfo]);

  useEffect(() => {
    if (user) {
      fetchCustomers();
      refreshAuthUsers();
      
      if (user.role === 'admin' && customers.length > 0) {
        const firstCompany = customers.find(c => c.company_id);
        if (firstCompany && firstCompany.company_id) {
          setSelectedCompanyId(firstCompany.company_id);
          console.log("Set default companyId for admin:", firstCompany.company_id);
        }
      } else if (user.companyId) {
        setSelectedCompanyId(user.companyId);
        console.log("Using user.companyId:", user.companyId);
      }
    }
  }, [user]);

  useEffect(() => {
    if (customers.length > 0 && !selectedCompanyId) {
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

  const hasValidAuthUsers = authUsers && authUsers.length > 0;
  
  const users = hasValidAuthUsers 
    ? authUsers 
    : formattedCustomers.filter(customer => customer.user_id !== undefined);

  const handleRefreshAll = async () => {
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest user and company data...",
      variant: "default"
    });
    
    try {
      await Promise.all([
        refreshAuthUsers(),
        fetchCustomers()
      ]);
      
      toast({
        title: "Refresh Complete",
        description: `Found ${customers.length} users.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Error",
        description: "There was a problem refreshing the data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <CustomerHeader 
        view={view}
        onViewChange={setView}
        onRefresh={handleRefreshAll}
        loading={isLoading || authUsersLoading}
        onInviteUser={() => setIsInviteModalOpen(true)}
        companyId={selectedCompanyId || undefined}
      />
      
      <CustomerStatusPanel 
        loading={isLoading}
        errorMsg={error}
        customerCount={customers.length}
        companyUsersCount={debugInfo.companyUsersCount || 0}
        onRepairAdmin={handleUserRoleRepair}
        isRepairing={isRepairing}
      />

      <Tabs 
        defaultValue="users" 
        value="users"
        className="w-full"
      >
        <TabsList>
          <TabsTrigger 
            value="users" 
            disabled={true}
            className="flex-1 bg-primary text-primary-foreground"
          >
            Benutzer ({customers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-4">
          {!isLoading && !error && customers.length > 0 && (
            <CustomerSearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
          
          <UsersSection
            users={customers} 
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
        onInvited={() => {
          refreshAuthUsers();
          fetchCustomers();
        }}
        companyId={selectedCompanyId || undefined}
      />
    </div>
  );
};

export default Customers;
