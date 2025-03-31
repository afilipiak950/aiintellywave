
import { useState, useEffect, useNavigate } from 'react';
import UserSectionHeader from './UserSectionHeader';
import UserTabs from './UserTabs';
import RoleManagementDialog from '@/components/ui/user/RoleManagementDialog';
import { Customer } from '@/hooks/customers/types';
import { useUserRoleManagement } from '@/hooks/admin/useUserRoleManagement';

interface UsersSectionProps {
  users: Customer[];
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
  const navigate = useNavigate();

  const {
    selectedUserId,
    isRoleDialogOpen,
    handleManageRole,
    handleCloseRoleDialog,
    handleRoleUpdated,
    findSelectedUser
  } = useUserRoleManagement(refreshUsers);
  
  // Force refresh when component mounts
  useEffect(() => {
    refreshUsers();
  }, []);
  
  // Find the selected user data
  const selectedUser = findSelectedUser(users);
  
  // Handle navigating to user details
  const handleUserClick = (userId: string) => {
    navigate(`/admin/customers/${userId}`);
  };
  
  // Filter users based on active tab
  const filteredUsers = users.filter(user => {
    // First apply search filter
    const searchMatch = !searchTerm || 
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!searchMatch) return false;
    
    // Then apply tab filter
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
      <UserSectionHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <UserTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loading={loading}
        filteredUsers={filteredUsers}
        handleUserClick={handleUserClick}
        handleManageRole={handleManageRole}
        refreshUsers={refreshUsers}
        getTabCount={getTabCount}
      />
      
      {/* Role Management Dialog */}
      <RoleManagementDialog
        isOpen={isRoleDialogOpen}
        onClose={handleCloseRoleDialog}
        userId={selectedUserId}
        userData={selectedUser}
        onRoleUpdated={handleRoleUpdated}
      />
    </div>
  );
};

export default UsersSection;
