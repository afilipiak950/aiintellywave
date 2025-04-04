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
      
      // First, delete from company_users table
      const { error: companyUsersError } = await supabase
        .from('company_users')
        .delete()
        .eq('user_id', userToDelete.id);
      
      if (companyUsersError) {
        throw companyUsersError;
      }
      
      // Delete from profiles table
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Delete from user_roles table
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userToDelete.id);
      
      if (rolesError) {
        throw rolesError;
      }

      // Finally, delete the user from auth.users using admin API
      const { error: authError } = await supabase.auth.admin.deleteUser(
        userToDelete.id
      );

      if (authError) {
        throw authError;
      }

      toast({
        title: "Customer deleted",
        description: `${userToDelete.name || 'Customer'} has been successfully deleted.`,
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
  
  const getBestCompanyName = (user: Customer): string => {
    const email = user.email || user.contact_email || '';
    
    // PRIORITY 1: Special cases for specific email domains - highest priority override
    if (email.toLowerCase().includes('@fact-talents.de')) {
      console.log(`[UserTable] User has fact-talents.de email: ${email} - forcing "Fact Talents"`);
      return 'Fact Talents';
    }
    
    if (email.toLowerCase().includes('@wbungert.com')) {
      console.log(`[UserTable] User has wbungert.com email: ${email} - forcing "Bungert"`);
      return 'Bungert';
    }
    
    if (email.toLowerCase().includes('@teso-specialist.de')) {
      console.log(`[UserTable] User has teso-specialist.de email: ${email} - forcing "Teso Specialist"`);
      return 'Teso Specialist';
    }
    
    // PRIORITY 2: Explicitly marked primary company
    if (user.associated_companies && user.associated_companies.length > 0) {
      const primaryCompany = user.associated_companies.find(company => 
        company.is_primary === true
      );
      
      if (primaryCompany) {
        console.log(`[UserTable] Using primary company: ${primaryCompany.name || primaryCompany.company_name}`);
        return primaryCompany.name || primaryCompany.company_name || 'No company name';
      }
    }
    
    // PRIORITY 3: Email domain matching for other emails
    if (email && email.includes('@') && user.associated_companies && user.associated_companies.length > 0) {
      const emailDomain = email.split('@')[1].toLowerCase();
      const domainPrefix = emailDomain.split('.')[0].toLowerCase();
      
      // Try to match based on email domain
      const domainMatch = user.associated_companies.find(company => {
        if (!company.name && !company.company_name) return false;
        const companyName = (company.name || company.company_name || '').toLowerCase();
        return (
          companyName === domainPrefix || 
          companyName.includes(domainPrefix) || 
          domainPrefix.includes(companyName)
        );
      });
      
      if (domainMatch) {
        console.log(`[UserTable] Found domain match: ${domainMatch.name || domainMatch.company_name}`);
        return domainMatch.name || domainMatch.company_name || 'No company name';
      }
    }
    
    // PRIORITY 4: Fallback to the first company in the list
    if (user.associated_companies && user.associated_companies.length > 0) {
      console.log(`[UserTable] Using first company in list: ${user.associated_companies[0].name || user.associated_companies[0].company_name}`);
      return user.associated_companies[0].name || 
             user.associated_companies[0].company_name || 
             'No company name';
    }
    
    // PRIORITY 5: Default fallback
    console.log(`[UserTable] Using fallback company: ${user.company || user.company_name || 'No company'}`);
    return user.company || user.company_name || 'No company';
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
                      <div className="font-medium text-gray-900">{user.name || 'Unknown'}</div>
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
                  {getBestCompanyName(user)}
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
              This action cannot be undone. This will permanently delete {userToDelete?.name || 'this customer'} and remove their data from the system.
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
