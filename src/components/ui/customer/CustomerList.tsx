
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
  
  // Helper function to determine the best company name to display
  const getBestCompanyName = (customer: UICustomer): string => {
    // First check for explicitly marked primary company
    if (customer.associated_companies && customer.associated_companies.length > 0) {
      const primaryCompany = customer.associated_companies.find(c => c.is_primary);
      
      if (primaryCompany) {
        return primaryCompany.name || primaryCompany.company_name || 'Unknown Company';
      }
    }
    
    // If no explicitly marked primary, try email domain matching
    const email = customer.email || customer.contact_email || '';
    
    if (email && email.includes('@') && customer.associated_companies && customer.associated_companies.length > 0) {
      const emailDomain = email.split('@')[1].toLowerCase();
      const domainPrefix = emailDomain.split('.')[0].toLowerCase();
      
      // Try to match based on email domain
      const domainMatch = customer.associated_companies.find(c => {
        if (!c.name && !c.company_name) return false;
        const companyName = (c.name || c.company_name || '').toLowerCase();
        return (
          companyName === domainPrefix || 
          companyName.includes(domainPrefix) || 
          domainPrefix.includes(companyName)
        );
      });
      
      if (domainMatch) {
        return domainMatch.name || domainMatch.company_name || 'Unknown Company';
      }
    }
    
    // Default to first company in the list
    if (customer.associated_companies && customer.associated_companies.length > 0) {
      return customer.associated_companies[0].name || 
             customer.associated_companies[0].company_name || 
             'Unknown Company';
    }
    
    // Fallback to other company fields
    return customer.company_name || customer.company || 'Unknown Company';
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
                <TableCell>{getBestCompanyName(customer)}</TableCell>
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
          customer={{
            ...customer,
            company: getBestCompanyName(customer) // Update company for display
          }}
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
