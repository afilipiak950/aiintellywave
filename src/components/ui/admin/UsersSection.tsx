
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserTable from '@/components/ui/user/UserTable';
import UserLoadingState from '@/components/ui/user/UserLoadingState';
import RoleManagementDialog from '@/components/ui/user/RoleManagementDialog';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { AuthUser } from '@/services/types/customerTypes';

interface UsersSectionProps {
  users: any[]; // Keep as any[] for backward compatibility
  loading: boolean;
  errorMsg: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refreshUsers: () => void;
}

const UsersSection = ({
  users,
  loading,
  errorMsg,
  searchTerm,
  setSearchTerm,
  refreshUsers
}: UsersSectionProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // Debug logs
  useEffect(() => {
    console.log('UsersSection rendered with', users.length, 'users');
    console.log('Loading state:', loading);
    console.log('Error message:', errorMsg);
  }, [users, loading, errorMsg]);
  
  // Find the selected user data
  const selectedUser = users.find(user => user.id === selectedUserId);
  
  // Handle manual refresh with loading state
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    console.log('Manual refresh triggered');
    try {
      await refreshUsers();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };
  
  // Enhanced preprocessing for users to fix any inconsistencies in company data
  const processedUsers = users.map(user => {
    const email = user.email || user.contact_email || '';
    
    // Special handling for specific email domains - ALWAYS OVERRIDE with highest priority
    if (email.toLowerCase().includes('@fact-talents.de')) {
      console.log(`[UsersSection] Processing fact-talents.de email: ${email}`);
      
      // For fact-talents.de emails, ALWAYS set company to "Fact Talents"
      // regardless of any other company associations
      return {
        ...user,
        company: 'Fact Talents',
        company_name: 'Fact Talents'
      };
    }
    
    if (email.toLowerCase().includes('@wbungert.com')) {
      console.log(`[UsersSection] Processing wbungert.com email: ${email}`);
      
      // For wbungert.com emails, ALWAYS set company to "Bungert"
      // regardless of any other company associations
      return {
        ...user,
        company: 'Bungert',
        company_name: 'Bungert'
      };
    }
    
    if (email.toLowerCase().includes('@teso-specialist.de')) {
      console.log(`[UsersSection] Processing teso-specialist.de email: ${email}`);
      
      // For teso-specialist.de emails, ALWAYS set company to "Teso Specialist"
      // regardless of any other company associations
      return {
        ...user,
        company: 'Teso Specialist',
        company_name: 'Teso Specialist'
      };
    }
    
    return user;
  });
  
  // Handle navigating to user details
  const handleUserClick = (userId: string) => {
    navigate(`/admin/customers/${userId}`);
  };
  
  // Handle opening the role management dialog
  const handleManageRole = (userId: string) => {
    setSelectedUserId(userId);
    setIsRoleDialogOpen(true);
  };
  
  // Handle closing the role management dialog
  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
    setSelectedUserId(null);
  };
  
  // Filter users based on active tab
  const filteredUsers = processedUsers.filter(user => {
    if (activeTab === 'all') return true;
    if (activeTab === 'admins') return user.role === 'admin';
    if (activeTab === 'managers') return user.role === 'manager';
    if (activeTab === 'customers') return user.role === 'customer' || !user.role;
    if (activeTab === 'active') return true; // We don't have a reliable active status
    if (activeTab === 'inactive') return false; // We don't have a reliable inactive status
    return true;
  });
  
  const getTabCount = (tabName: string) => {
    if (tabName === 'all') return users.length;
    if (tabName === 'admins') return users.filter(user => user.role === 'admin').length;
    if (tabName === 'managers') return users.filter(user => user.role === 'manager').length;
    if (tabName === 'customers') return users.filter(user => user.role === 'customer' || !user.role).length;
    if (tabName === 'active') return users.length; // We don't have a reliable active status
    if (tabName === 'inactive') return 0; // We don't have a reliable inactive status
    return 0;
  };

  if (loading) {
    return <UserLoadingState />;
  }
  
  if (errorMsg) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Users</h3>
        <p className="text-gray-500 mb-4">{errorMsg}</p>
        <Button 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Try Again'
          )}
        </Button>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
        <p className="text-gray-500 mb-4">There are no users in the system or you don't have permission to view them.</p>
        <Button 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh Users'
          )}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-card rounded-lg shadow">
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">System Users</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-8 flex items-center gap-1"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
          </div>
          <div className="max-w-xs w-full">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-3 py-2 border border-border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-2">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Users ({getTabCount('all')})
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Admins ({getTabCount('admins')})
            </TabsTrigger>
            <TabsTrigger value="managers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Managers ({getTabCount('managers')})
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Customers ({getTabCount('customers')})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Active ({getTabCount('active')})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Inactive ({getTabCount('inactive')})
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab} className="p-0 mt-0">
          <UserTable 
            users={filteredUsers} 
            onUserClick={handleUserClick}
            onManageRole={handleManageRole}
            onRefresh={refreshUsers}
          />
        </TabsContent>
      </Tabs>
      
      {/* Role Management Dialog */}
      <RoleManagementDialog
        isOpen={isRoleDialogOpen}
        onClose={handleCloseRoleDialog}
        userId={selectedUserId}
        userData={selectedUser}
        onRoleUpdated={refreshUsers}
      />
    </div>
  );
};

export default UsersSection;
