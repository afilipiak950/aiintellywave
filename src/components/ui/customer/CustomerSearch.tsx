
import { Search, Filter, ArrowDownUp } from 'lucide-react';

interface CustomerSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CustomerSearch = ({ searchTerm, setSearchTerm }: CustomerSearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="flex-1 relative">
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
      
      <div className="flex space-x-4">
        <div className="relative inline-block">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter size={16} className="mr-2" />
            Filter
          </button>
        </div>
        
        <div className="relative inline-block">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowDownUp size={16} className="mr-2" />
            Sort
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearch;
