import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CompanyData, UserData } from '@/services/types/customerTypes';
import { Mail, Phone, User, UserPlus } from 'lucide-react';

interface CompanyUsersListProps {
  companies: CompanyData[];
  usersByCompany: Record<string, UserData[]>;
  onCompanyUpdated?: () => void;
}

const CompanyUsersList = ({ 
  companies, 
  usersByCompany,
  onCompanyUpdated 
}: CompanyUsersListProps) => {
  const navigate = useNavigate();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  if (!companies || companies.length === 0) {
    return <div className="text-center p-6 text-gray-500">No company data available.</div>;
  }
  
  const company = companies[0]; // Just use the first company in the array
  const users = usersByCompany[company.id] || [];
  
  const handleUserClick = (userId: string) => {
    navigate(`/admin/customers/${userId}`);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Company Users</h3>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsAddUserDialogOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Add User
        </Button>
      </div>
      
      {users.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.user_id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleUserClick(user.user_id || '')}
                >
                  <TableCell className="font-medium flex items-center gap-2">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                    )}
                    {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail size={14} className="text-gray-400" />
                      <span>{user.email || 'No email'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{user.role || 'customer'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone size={14} className="text-gray-400" />
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-md border">
          <User size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No users associated with this company.</p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-4"
            onClick={() => setIsAddUserDialogOpen(true)}
          >
            Add First User
          </Button>
        </div>
      )}
      
      {/* This would be a placeholder for the AddUserDialog component that you might want to implement later */}
      {/* 
      {isAddUserDialogOpen && (
        <AddUserDialog
          companyId={company.id}
          isOpen={isAddUserDialogOpen}
          onClose={() => setIsAddUserDialogOpen(false)}
          onUserAdded={onCompanyUpdated}
        />
      )} 
      */}
    </div>
  );
};

export default CompanyUsersList;
