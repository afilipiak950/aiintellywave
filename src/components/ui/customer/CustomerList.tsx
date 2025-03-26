
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer } from '@/hooks/use-customers';
import CustomerCard from './CustomerCard';
import CustomerEmptyState from './CustomerEmptyState';

interface CustomerListProps {
  customers: Customer[];
  searchTerm: string;
}

const CustomerList = ({ customers, searchTerm }: CustomerListProps) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('CustomerList rendered with customers:', customers);
  }, [customers]);

  const handleCustomerClick = (customerId: string) => {
    navigate(`/admin/customers/${customerId}`);
  };

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
          onClick={() => handleCustomerClick(customer.id)}
        >
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm mb-2 font-medium text-gray-700">User Info:</div>
            <div className="text-sm text-gray-500">
              Email: {customer.email || customer.contact_email || 'No email available'}
            </div>
            {customer.position && (
              <div className="text-sm text-gray-500">
                Position: {customer.position}
              </div>
            )}
            {customer.company_role && (
              <div className="text-sm text-gray-500">
                Role: <span className="capitalize">{customer.company_role}</span>
              </div>
            )}
          </div>
        </CustomerCard>
      ))}
    </div>
  );
};

export default CustomerList;
