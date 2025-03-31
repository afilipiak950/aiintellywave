
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Customer } from '@/hooks/customers/types';
import { Button } from "@/components/ui/button";

interface UserTableRowProps {
  user: Customer;
  getDisplayName: (user: Customer) => string;
  onUserClick: (userId: string) => void;
  onManageRole: (userId: string, e: React.MouseEvent) => void;
  onDeleteClick: (user: Customer, e: React.MouseEvent) => void;
}

const UserTableRow = ({
  user, 
  getDisplayName, 
  onUserClick, 
  onManageRole, 
  onDeleteClick
}: UserTableRowProps) => {
  return (
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
                alt={getDisplayName(user)} 
                className="h-8 w-8 rounded-full"
              />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{getDisplayName(user)}</div>
            <div className="text-xs text-gray-500">{user.id.substring(0, 8)}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {user.email || user.contact_email || 'No email'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="capitalize">{user.role || user.company_role || 'No role'}</span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {user.company || user.company_name || 'No company'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2 justify-end">
          <button
            onClick={(e) => onManageRole(user.id, e)}
            className="text-primary-600 hover:text-primary-900 px-2 py-1"
          >
            Manage Role
          </button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 flex items-center"
            onClick={(e) => onDeleteClick(user, e)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;
