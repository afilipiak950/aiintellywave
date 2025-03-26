
import { AuthUser } from '@/services/types/customerTypes';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { User, UserCog } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface UserTableProps {
  users: AuthUser[];
  onUserClick?: (userId: string) => void;
  onManageRole?: (userId: string) => void;
}

const UserTable = ({ users, onUserClick, onManageRole }: UserTableProps) => {
  // Helper function to format date strings
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Helper function to get user name
  const getUserName = (user: AuthUser) => {
    if (user.full_name) return user.full_name;
    
    if (user.user_metadata?.name) return user.user_metadata.name;
    
    const firstName = user.first_name || user.user_metadata?.first_name || '';
    const lastName = user.last_name || user.user_metadata?.last_name || '';
    
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    
    return 'No name provided';
  };
  
  // Helper function to get user role with fallback
  const getUserRole = (user: AuthUser) => {
    return user.user_metadata?.role || 'customer';
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Sign In</TableHead>
            {onManageRole && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id}
              onClick={onUserClick ? () => onUserClick(user.id) : undefined}
              className={onUserClick ? "cursor-pointer" : ""}
            >
              <TableCell className="font-medium">{getUserName(user)}</TableCell>
              <TableCell>{user.email || '-'}</TableCell>
              <TableCell className="capitalize">{getUserRole(user)}</TableCell>
              <TableCell>{formatDate(user.created_at || user.created_at_auth)}</TableCell>
              <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
              {onManageRole && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onManageRole(user.id)}
                    className="flex items-center gap-1"
                  >
                    <UserCog size={16} />
                    <span>Manage Role</span>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
