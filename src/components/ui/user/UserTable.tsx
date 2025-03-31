
import { Customer } from '@/hooks/customers/types';

interface UserTableProps {
  users: Customer[];
  onUserClick: (userId: string) => void;
  onManageRole: (userId: string) => void;
}

const UserTable = ({ users, onUserClick, onManageRole }: UserTableProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }
  
  return (
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
                {user.company || user.company_name || 'No company'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onManageRole(user.id);
                  }}
                  className="text-primary-600 hover:text-primary-900 px-2 py-1"
                >
                  Manage Role
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
