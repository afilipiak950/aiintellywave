
import { Search } from 'lucide-react';
import UserTable from '../user/UserTable';
import UserLoadingState from '../user/UserLoadingState';
import { AuthUser } from '@/services/types/customerTypes';

interface UsersSectionProps {
  users: AuthUser[];
  loading: boolean;
  errorMsg: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UsersSection = ({
  users,
  loading,
  errorMsg,
  searchTerm,
  setSearchTerm
}: UsersSectionProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-6">
        <h2 className="text-lg font-semibold">System Users</h2>
        
        {/* Search */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <UserLoadingState />
      ) : errorMsg ? (
        <div className="py-8 text-center">
          <p className="text-red-500">{errorMsg}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <UserTable users={users} />
      )}
    </div>
  );
};

export default UsersSection;
