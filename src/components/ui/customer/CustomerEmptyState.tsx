
import { Search } from 'lucide-react';

interface CustomerEmptyStateProps {
  searchTerm: string;
}

const CustomerEmptyState = ({ searchTerm }: CustomerEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
        <Search size={24} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
      <p className="text-gray-500">
        We couldn't find any customers matching your search criteria. Try adjusting your filters or create a new customer.
      </p>
    </div>
  );
};

export default CustomerEmptyState;
