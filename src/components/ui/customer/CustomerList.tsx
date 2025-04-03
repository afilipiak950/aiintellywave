
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UICustomer } from '@/types/customer';
import CustomerCard from './CustomerCard';
import CustomerEmptyState from './CustomerEmptyState';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface CustomerListProps {
  customers: UICustomer[];
  searchTerm: string;
  view?: 'grid' | 'table';
}

const CustomerList = ({ customers, searchTerm, view = 'grid' }: CustomerListProps) => {
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

  if (view === 'table') {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow 
                key={customer.id}
                onClick={() => handleCustomerClick(customer.id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">{customer.name || 'Unknown'}</TableCell>
                <TableCell>{customer.email || customer.contact_email || '-'}</TableCell>
                <TableCell className="capitalize">{customer.role || customer.company_role || '-'}</TableCell>
                <TableCell>{customer.company_name || customer.company || '-'}</TableCell>
                <TableCell>
                  {[customer.city, customer.country].filter(Boolean).join(', ') || '-'}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                    customer.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status || 'active'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
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
            {(customer.role || customer.company_role) && (
              <div className="text-sm text-gray-500">
                Role: <span className="capitalize">{customer.role || customer.company_role}</span>
              </div>
            )}
            {customer.status && (
              <div className="text-sm text-gray-500">
                Status: <span className={`capitalize ${
                  customer.status === 'active' ? 'text-green-600' : 
                  customer.status === 'inactive' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>{customer.status}</span>
              </div>
            )}
          </div>
        </CustomerCard>
      ))}
    </div>
  );
};

export default CustomerList;
