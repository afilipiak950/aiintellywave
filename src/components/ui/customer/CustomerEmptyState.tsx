
import { Search } from 'lucide-react';
import { useEffect } from 'react';

interface CustomerEmptyStateProps {
  searchTerm: string;
}

const CustomerEmptyState = ({ searchTerm }: CustomerEmptyStateProps) => {
  useEffect(() => {
    console.log('CustomerEmptyState rendered with searchTerm:', searchTerm);
  }, [searchTerm]);

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
        <Search size={24} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
      <p className="text-gray-500">
        {searchTerm ? 
          `We couldn't find any customers matching "${searchTerm}". Try adjusting your search criteria.` :
          'No customers are available. This could be due to permissions or because no customers have been created yet.'
        }
      </p>
    </div>
  );
};

export default CustomerEmptyState;
