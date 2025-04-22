
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
import { supabase } from '@/integrations/supabase/client';

const Customers = () => {
  const { user } = useAuth();
  
  const [manualAuthUsers, setManualAuthUsers] = useState<any[]>([]);
  const [manualLoading, setManualLoading] = useState(true);
  const [manualError, setManualError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get users with traditional hook (which might not work due to admin permission issues)
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
    debugInfo = undefined
  } = useCustomers();
  
  const {
    isRepairing,
    isRepairingCompanyUsers,
    handleUserRoleRepair,
    handleCompanyUsersRepair
  } = useAdminRepair(fetchCustomers);
  
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // New function to fetch users manually bypassing admin API issues
  const fetchUsersManually = async () => {
    setManualLoading(true);
    setManualError(null);
    
    try {
      console.log('Fetching users manually from multiple sources...');
      const results = [];
      
      // 1. Try to get from company_users
      const { data: companyUsers, error: companyError } = await supabase
        .from('company_users')
        .select(`
          user_id,
          email,
          full_name,
          first_name,
          last_name,
          role,
          avatar_url,
          company_id,
          companies:company_id (id, name)
        `);
      
      if (companyError) {
        console.error('Error fetching company_users:', companyError);
      } else if (companyUsers?.length) {
        console.log(`Found ${companyUsers.length} users in company_users`);
        results.push(...companyUsers.map(u => ({
          id: u.user_id,
          user_id: u.user_id,
          email: u.email,
          name: u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          full_name: u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          first_name: u.first_name,
          last_name: u.last_name,
          role: u.role,
          avatar_url: u.avatar_url,
          company_id: u.company_id,
          company_name: u.companies?.name,
          company: u.companies?.name
        })));
      }
      
      // 2. Try to get from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else if (profiles?.length) {
        console.log(`Found ${profiles.length} users in profiles`);
        
        // Add any profiles not already in results
        for (const profile of profiles) {
          if (!results.some(u => u.id === profile.id)) {
            results.push({
              id: profile.id,
              user_id: profile.id,
              name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
              full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url,
              role: 'customer' // Default role
            });
          }
        }
      }
      
      // 3. Try to get role information
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
        
      if (rolesError) {
        console.error('Error fetching user_roles:', rolesError);
      } else if (userRoles?.length) {
        console.log(`Found ${userRoles.length} roles in user_roles`);
        
        // Update roles for existing users
        for (const userRole of userRoles) {
          const existingUser = results.find(u => u.id === userRole.user_id);
          if (existingUser) {
            existingUser.role = userRole.role;
          } else {
            // If user doesn't exist in results yet, add a minimal entry
            results.push({
              id: userRole.user_id,
              user_id: userRole.user_id,
              role: userRole.role,
              name: 'User ' + userRole.user_id.substring(0, 6)
            });
          }
        }
      }
      
      console.log(`Final result: ${results.length} total users found`);
      
      if (results.length === 0) {
        setManualError('No users found in any data source');
      } else {
        setManualAuthUsers(results);
      }
    } catch (error: any) {
      console.error('Error in manual fetch:', error);
      setManualError(error.message || 'Unknown error fetching users');
    } finally {
      setManualLoading(false);
    }
  };
  
  // Function to refresh all data
  const handleRefreshAll = async () => {
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest user and company data...",
      variant: "default"
    });
    
    try {
      await Promise.all([
        fetchUsersManually(),
        refreshAuthUsers(),
        fetchCustomers()
      ]);
      
      toast({
        title: "Refresh Complete",
        description: `Found users and companies.`,
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
  
  useEffect(() => {
    if (user) {
      fetchUsersManually();
      fetchCustomers();
    }
  }, [user]);

  useEffect(() => {
    // Log information about available user data to assist with debugging
    console.log('Manual fetch:', { 
      users: manualAuthUsers.length, 
      loading: manualLoading, 
      error: manualError 
    });
    console.log('Traditional hook:', { 
      users: authUsers.length, 
      loading: authUsersLoading, 
      error: authUsersError 
    });
  }, [manualAuthUsers, manualLoading, authUsers, authUsersLoading]);
  
  // Determine which user source to use - prefer manual fetch if it has users
  const hasManualUsers = manualAuthUsers.length > 0;
  const hasTraditionalUsers = authUsers.length > 0;
  
  const usersToDisplay = hasManualUsers 
    ? manualAuthUsers 
    : (hasTraditionalUsers ? authUsers : []);
    
  const usersLoading = hasManualUsers 
    ? manualLoading 
    : (hasTraditionalUsers ? authUsersLoading : false);
    
  const usersError = hasManualUsers 
    ? manualError 
    : (hasTraditionalUsers ? authUsersError : "No user data available");

  // Format the data for display
  const formattedCustomers = customers.map(customer => ({
    ...customer,
    status: customer.status === 'inactive' ? 'inactive' : 'active',
    user_id: customer.user_id || customer.id
  })) as UICustomer[];

  // Get company information
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
    
    return isCompany;
  });

  return (
    <div className="p-4 space-y-6">
      <CustomerHeader 
        view={view}
        onViewChange={setView}
        onRefresh={handleRefreshAll}
        loading={isLoading || usersLoading}
        onInviteUser={() => setIsInviteModalOpen(true)}
        companyId={selectedCompanyId || undefined}
      />
      
      <CustomerStatusPanel 
        loading={usersLoading}
        errorMsg={usersError}
        customerCount={usersToDisplay.length}
        companyUsersCount={debugInfo?.companyUsersCount || 0}
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
            Benutzer ({usersToDisplay.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-4">
          {!usersLoading && !usersError && usersToDisplay.length > 0 && (
            <CustomerSearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
          
          <UsersSection
            users={usersToDisplay.filter(user => {
              if (!searchTerm) return true;
              
              const searchLower = searchTerm.toLowerCase();
              return (
                (user.name?.toLowerCase().includes(searchLower)) ||
                (user.email?.toLowerCase().includes(searchLower)) ||
                (user.company?.toLowerCase().includes(searchLower)) ||
                (user.role?.toLowerCase().includes(searchLower))
              );
            })}
            loading={usersLoading}
            errorMsg={usersError}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            refreshUsers={hasManualUsers ? fetchUsersManually : refreshAuthUsers}
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
          fetchUsersManually();
          refreshAuthUsers();
          fetchCustomers();
        }}
        companyId={selectedCompanyId || undefined}
      />
    </div>
  );
};

export default Customers;
