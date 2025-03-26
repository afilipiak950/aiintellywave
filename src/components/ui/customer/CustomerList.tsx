
import { Customer } from '@/hooks/use-customers';
import CustomerCard from './CustomerCard';
import CustomerEmptyState from './CustomerEmptyState';

interface CustomerListProps {
  customers: Customer[];
  searchTerm: string;
}

const CustomerList = ({ customers, searchTerm }: CustomerListProps) => {
  // No results state
  if (customers.length === 0) {
    return <CustomerEmptyState searchTerm={searchTerm} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customers.map((customer) => (
        <div key={customer.id} className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-900">{customer.name}</h2>
          <p className="text-gray-500">Email: {customer.contact_email || 'N/A'}</p>
          <p className="text-gray-500">Phone: {customer.contact_phone || 'N/A'}</p>
          <p className="text-gray-500">
            Location: {[customer.city, customer.country].filter(Boolean).join(', ') || 'N/A'}
          </p>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Users:</h3>
            {customer.users && customer.users.length > 0 ? (
              customer.users.map((user) => (
                <div key={user.id} className="text-sm text-gray-500">
                  {user.email}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No users assigned</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerList;
