
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types/customer';
import CustomerCard from './CustomerCard';
import CustomerEmptyState from './CustomerEmptyState';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface CustomerListProps {
  customers: Customer[];
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
          </div>
        </CustomerCard>
      ))}
    </div>
  );
};

export default CustomerList;
