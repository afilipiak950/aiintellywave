
import UserSearchBar from './UserSearchBar';

interface UserSectionHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UserSectionHeader = ({ searchTerm, setSearchTerm }: UserSectionHeaderProps) => {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-lg font-semibold">System Users</h3>
        <UserSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
    </div>
  );
};

export default UserSectionHeader;
