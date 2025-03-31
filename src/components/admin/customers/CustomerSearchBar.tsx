
import { Search } from "lucide-react";

interface CustomerSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CustomerSearchBar = ({ searchTerm, setSearchTerm }: CustomerSearchBarProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
        placeholder="Search customers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default CustomerSearchBar;
