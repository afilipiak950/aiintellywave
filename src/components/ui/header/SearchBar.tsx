
import { Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="search"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="Search..."
      />
    </div>
  );
};

export default SearchBar;
