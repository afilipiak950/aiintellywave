
import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  userToDelete: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
  getDisplayName: (user: Customer) => string;
}

const DeleteConfirmationDialog = ({
  isOpen,
  userToDelete,
  onClose,
  onSuccess,
  getDisplayName,
}: DeleteConfirmationDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      
      console.log('Deleting user with ID:', userToDelete.id);
      
      // Use the Edge Function to delete the user
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId: userToDelete.id }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data || data.error) {
        console.error('Function returned error:', data?.error || 'Unknown error');
        throw new Error(data?.error || 'Unknown error in deletion process');
      }

      toast({
        title: "Customer deleted",
        description: `${getDisplayName(userToDelete)} has been successfully deleted.`,
      });
      
      // Refresh the customer list
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error deleting customer",
        description: error.message || "An error occurred while deleting the customer.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this customer?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {userToDelete ? getDisplayName(userToDelete) : 'this customer'} and remove their data from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>Cancel</AlertDialogCancel>
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
  );
};

export default DeleteConfirmationDialog;
