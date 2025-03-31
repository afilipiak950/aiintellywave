
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserTable from '@/components/ui/user/UserTable';
import UserLoadingState from '@/components/ui/user/UserLoadingState';
import RoleManagementDialog from '@/components/ui/user/RoleManagementDialog';
import { Customer } from '@/types/customer'; // Changed from AuthUser to Customer

interface UsersSectionProps {
  users: Customer[]; // Changed from AuthUser[] to Customer[]
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
  const navigate = useNavigate();
  
  // Find the selected user data
  const selectedUser = users.find(user => user.id === selectedUserId);
  
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
  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true;
    if (activeTab === 'admins') return user.role === 'admin';
    if (activeTab === 'managers') return user.role === 'manager';
    if (activeTab === 'customers') return user.role === 'customer';
    if (activeTab === 'active') return true; // We don't have last_sign_in_at in Customer type
    if (activeTab === 'inactive') return false; // We don't have last_sign_in_at in Customer type
    return true;
  });
  
  const getTabCount = (tabName: string) => {
    if (tabName === 'all') return users.length;
    if (tabName === 'admins') return users.filter(user => user.role === 'admin').length;
    if (tabName === 'managers') return users.filter(user => user.role === 'manager').length;
    if (tabName === 'customers') return users.filter(user => user.role === 'customer').length;
    if (tabName === 'active') return users.length; // We don't have last_sign_in_at in Customer type
    if (tabName === 'inactive') return 0; // We don't have last_sign_in_at in Customer type
    return 0;
  };
  
  return (
    <div className="bg-card rounded-lg shadow">
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-lg font-semibold">System Users</h3>
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
        
        <TabsContent value="all" className="p-0 mt-0">
          {loading ? (
            <UserLoadingState />
          ) : (
            <UserTable 
              users={filteredUsers} 
              onUserClick={handleUserClick}
              onManageRole={handleManageRole}
            />
          )}
        </TabsContent>
        
        <TabsContent value="admins" className="p-0 mt-0">
          {loading ? (
            <UserLoadingState />
          ) : (
            <UserTable 
              users={filteredUsers} 
              onUserClick={handleUserClick}
              onManageRole={handleManageRole}
            />
          )}
        </TabsContent>
        
        <TabsContent value="managers" className="p-0 mt-0">
          {loading ? (
            <UserLoadingState />
          ) : (
            <UserTable 
              users={filteredUsers} 
              onUserClick={handleUserClick}
              onManageRole={handleManageRole}
            />
          )}
        </TabsContent>
        
        <TabsContent value="customers" className="p-0 mt-0">
          {loading ? (
            <UserLoadingState />
          ) : (
            <UserTable 
              users={filteredUsers} 
              onUserClick={handleUserClick}
              onManageRole={handleManageRole}
            />
          )}
        </TabsContent>
        
        <TabsContent value="active" className="p-0 mt-0">
          {loading ? (
            <UserLoadingState />
          ) : (
            <UserTable 
              users={filteredUsers} 
              onUserClick={handleUserClick}
              onManageRole={handleManageRole}
            />
          )}
        </TabsContent>
        
        <TabsContent value="inactive" className="p-0 mt-0">
          {loading ? (
            <UserLoadingState />
          ) : (
            <UserTable 
              users={filteredUsers} 
              onUserClick={handleUserClick}
              onManageRole={handleManageRole}
            />
          )}
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
