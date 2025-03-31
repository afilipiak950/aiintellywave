
import React from 'react';
import { Customer } from '@/hooks/customers/types';
import UserTableRow from './UserTableRow';

interface UserTableBodyProps {
  users: Customer[];
  getDisplayName: (user: Customer) => string;
  onUserClick: (userId: string) => void;
  onManageRole: (userId: string, e: React.MouseEvent) => void;
  onDeleteClick: (user: Customer, e: React.MouseEvent) => void;
}

const UserTableBody = ({
  users,
  getDisplayName,
  onUserClick,
  onManageRole,
  onDeleteClick,
}: UserTableBodyProps) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {users.map((user) => (
        <UserTableRow
          key={user.id}
          user={user}
          getDisplayName={getDisplayName}
          onUserClick={onUserClick}
          onManageRole={(userId, e) => onManageRole(userId, e)}
          onDeleteClick={(user, e) => onDeleteClick(user, e)}
        />
      ))}
    </tbody>
  );
};

export default UserTableBody;
