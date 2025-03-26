
import { useEffect } from 'react';
import { Customer } from '@/hooks/use-customers';
import CustomerCard from './CustomerCard';
import CustomerEmptyState from './CustomerEmptyState';

interface CustomerListProps {
  customers: Customer[];
  searchTerm: string;
}

const CustomerList = ({ customers, searchTerm }: CustomerListProps) => {
  useEffect(() => {
    console.log('CustomerList rendered with customers:', customers);
  }, [customers]);

  // No results state
  if (customers.length === 0) {
    return <CustomerEmptyState searchTerm={searchTerm} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customers.map((customer) => (
        <CustomerCard 
          key={customer.id} 
          customer={customer}
        >
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm mb-2 font-medium text-gray-700">Users:</div>
            {/* Safely handle the case when users might not be accessible due to RLS issues */}
            <div className="text-sm text-gray-500">
              {customer.users ? 
                (customer.users.length > 0 ? 
                  "Users available" : 
                  "No users assigned") : 
                "Unable to load users"
              }
            </div>
          </div>
        </CustomerCard>
      ))}
    </div>
  );
};

export default CustomerList;
