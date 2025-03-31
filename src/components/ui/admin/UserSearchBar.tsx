
interface UserSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UserSearchBar = ({ searchTerm, setSearchTerm }: UserSearchBarProps) => {
  return (
    <div className="max-w-xs w-full">
      <input
        type="text"
        placeholder="Search users..."
        className="w-full px-3 py-2 border border-border rounded-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default UserSearchBar;
