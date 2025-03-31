
import { useState, useEffect } from 'react';
import { Customer } from '@/hooks/customers/types';
import EmptyUserTable from './EmptyUserTable';
import UserTableHeader from './UserTableHeader';
import UserTableBody from './UserTableBody';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { getDisplayName } from './utils/userDisplayUtils';

interface UserTableProps {
  users: Customer[];
  onUserClick: (userId: string) => void;
  onManageRole: (userId: string) => void;
  onRefresh?: () => void;
}

const UserTable = ({ users, onUserClick, onManageRole, onRefresh }: UserTableProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Customer | null>(null);
  
  // Force refresh when the component mounts to ensure we have the latest data
  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, []);

  if (!users || users.length === 0) {
    return <EmptyUserTable />;
  }
  
  const handleDeleteClick = (user: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleManageRole = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onManageRole(userId);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <UserTableHeader />
          <UserTableBody
            users={users}
            getDisplayName={getDisplayName}
            onUserClick={onUserClick}
            onManageRole={handleManageRole}
            onDeleteClick={handleDeleteClick}
          />
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        userToDelete={userToDelete}
        onClose={handleCancelDelete}
        onSuccess={handleDeleteSuccess}
        getDisplayName={getDisplayName}
      />
    </>
  );
};

export default UserTable;
