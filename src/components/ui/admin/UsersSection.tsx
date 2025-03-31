import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  
  useEffect(() => {
    refreshUsers();
  }, []);
  
  const selectedUser = findSelectedUser(users);
  
  const handleUserClick = (userId: string) => {
    navigate(`/admin/customers/${userId}`);
  };
  
  const filteredUsers = users.filter(user => {
    const searchMatch = !searchTerm || 
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!searchMatch) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'admins') return user.role === 'admin';
    if (activeTab === 'managers') return user.role === 'manager';
    if (activeTab === 'customers') return user.role === 'customer';
    if (activeTab === 'active') return true;
    if (activeTab === 'inactive') return false;
    return true;
  });
  
  const getTabCount = (tabName: string) => {
    if (tabName === 'all') return users.length;
    if (tabName === 'admins') return users.filter(user => user.role === 'admin').length;
    if (tabName === 'managers') return users.filter(user => user.role === 'manager').length;
    if (tabName === 'customers') return users.filter(user => user.role === 'customer').length;
    if (tabName === 'active') return users.length;
    if (tabName === 'inactive') return 0;
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
