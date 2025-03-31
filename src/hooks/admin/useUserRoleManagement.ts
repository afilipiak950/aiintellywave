
import { useState } from 'react';
import { Customer } from '@/hooks/customers/types';
import { toast } from '@/hooks/use-toast';

export function useUserRoleManagement(refreshUsers: () => void) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  
  // Find the selected user data based on the user ID and users list
  const findSelectedUser = (users: Customer[]) => {
    return users.find(user => user.id === selectedUserId);
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

  // Handle successful role update
  const handleRoleUpdated = () => {
    refreshUsers();
    toast({
      title: "User role updated",
      description: "The user's role has been updated successfully.",
    });
  };
  
  return {
    selectedUserId,
    isRoleDialogOpen,
    handleManageRole,
    handleCloseRoleDialog,
    handleRoleUpdated,
    findSelectedUser
  };
}
