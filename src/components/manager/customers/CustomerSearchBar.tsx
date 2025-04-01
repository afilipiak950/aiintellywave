
import { Search } from 'lucide-react';

interface CustomerSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  customersCount: number;
}

const CustomerSearchBar = ({ searchTerm, setSearchTerm, customersCount }: CustomerSearchBarProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Kunden suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Gefundene Kunden: {customersCount}</p>
      </div>
    </div>
  );
};

export default CustomerSearchBar;
