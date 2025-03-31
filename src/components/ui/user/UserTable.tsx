
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Customer } from '@/hooks/customers/types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface UserTableProps {
  users: Customer[];
  onUserClick: (userId: string) => void;
  onManageRole: (userId: string) => void;
  onRefresh?: () => void;
}

const UserTable = ({ users, onUserClick, onManageRole, onRefresh }: UserTableProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }
  
  const handleDeleteClick = (user: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Use the Edge Function to delete the user
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId: userToDelete.id }
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Customer deleted",
        description: `${userToDelete.name || userToDelete.full_name || 'Customer'} has been successfully deleted.`,
      });
      
      // Refresh the customer list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error deleting customer",
        description: error.message || "An error occurred while deleting the customer.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => onUserClick(user.id)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {(user.avatar_url || user.avatar) && (
                      <div className="flex-shrink-0 h-8 w-8 mr-3">
                        <img 
                          src={user.avatar_url || user.avatar} 
                          alt={user.name || 'User'} 
                          className="h-8 w-8 rounded-full"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{user.name || user.full_name || user.email || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{user.id.substring(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {user.email || user.contact_email || 'No email'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="capitalize">{user.role || 'No role'}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {user.company || user.company_name || 'No company'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onManageRole(user.id);
                      }}
                      className="text-primary-600 hover:text-primary-900 px-2 py-1"
                    >
                      Manage Role
                    </button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 flex items-center"
                      onClick={(e) => handleDeleteClick(user, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {userToDelete?.name || userToDelete?.full_name || userToDelete?.email || 'this customer'} and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserTable;
