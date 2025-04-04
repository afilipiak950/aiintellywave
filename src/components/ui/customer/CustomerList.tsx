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
  
  // Improved helper function to determine the best company name to display
  const getBestCompanyName = (customer: UICustomer): string => {
    console.log('Determining best company for customer:', customer.name, customer);
    
    // Special case for specific email domains - highest priority override
    const email = customer.email || customer.contact_email || '';
    
    if (email.toLowerCase().includes('@fact-talents.de')) {
      console.log('[CustomerList] Overriding company name to "Fact Talents" for fact-talents.de email');
      return 'Fact Talents';
    }
    
    if (email.toLowerCase().includes('@wbungert.com')) {
      console.log('[CustomerList] Overriding company name to "Bungert" for wbungert.com email');
      return 'Bungert';
    }
    
    if (email.toLowerCase().includes('@teso-specialist.de')) {
      console.log('[CustomerList] Overriding company name to "Teso Specialist" for teso-specialist.de email');
      return 'Teso Specialist';
    }
    
    // First check for explicitly marked primary company
    if (customer.associated_companies && customer.associated_companies.length > 0) {
      const primaryCompany = customer.associated_companies.find(c => c.is_primary);
      
      if (primaryCompany) {
        console.log('Found primary company:', primaryCompany.name);
        return primaryCompany.name || primaryCompany.company_name || 'Unknown Company';
      }
    }
    
    // If no explicitly marked primary, try email domain matching with improved logic
    if (email && email.includes('@') && customer.associated_companies && customer.associated_companies.length > 0) {
      const emailDomain = email.split('@')[1].toLowerCase();
      
      // Extract domain without TLD (e.g., "fact-talents" from "fact-talents.de")
      const domainName = emailDomain.split('.')[0].toLowerCase();
      
      console.log('Trying email domain match for:', emailDomain, 'domain name:', domainName);
      
      // Exact domain match (highest priority)
      const exactDomainMatch = customer.associated_companies.find(c => {
        if (!c.name && !c.company_name) return false;
        const companyName = (c.name || c.company_name || '').toLowerCase();
        
        // Check for exact matches between domain and company name
        return emailDomain === companyName || domainName === companyName;
      });
      
      if (exactDomainMatch) {
        console.log('Found exact domain match company:', exactDomainMatch.name);
        return exactDomainMatch.name || exactDomainMatch.company_name || 'Unknown Company';
      }
      
      // Try matching domain part in company name
      const domainInCompanyMatch = customer.associated_companies.find(c => {
        if (!c.name && !c.company_name) return false;
        const companyName = (c.name || c.company_name || '').toLowerCase();
        
        // Check if company name contains domain part or vice versa
        return companyName.includes(domainName) || domainName.includes(companyName);
      });
      
      if (domainInCompanyMatch) {
        console.log('Found domain-in-company match:', domainInCompanyMatch.name);
        return domainInCompanyMatch.name || domainInCompanyMatch.company_name || 'Unknown Company';
      }
      
      // Special case for fact-talents.de
      if (emailDomain === 'fact-talents.de') {
        const factTalentsMatch = customer.associated_companies.find(c => {
          if (!c.name && !c.company_name) return false;
          const companyName = (c.name || c.company_name || '').toLowerCase();
          return companyName.includes('fact') && companyName.includes('talent');
        });
        
        if (factTalentsMatch) {
          console.log('Found special case match for fact-talents.de:', factTalentsMatch.name);
          return factTalentsMatch.name || factTalentsMatch.company_name || 'Unknown Company';
        }
      }
      
      // Try token matching as last resort
      const tokenMatch = customer.associated_companies.find(c => {
        if (!c.name && !c.company_name) return false;
        const companyName = (c.name || c.company_name || '').toLowerCase();
        const companyTokens = companyName.split(/[\s-_]+/);
        const domainTokens = domainName.split(/[\s-_]+/);
        
        return companyTokens.some(companyToken => 
          domainTokens.some(domainToken => 
            companyToken.includes(domainToken) || domainToken.includes(companyToken)
          )
        );
      });
      
      if (tokenMatch) {
        console.log('Found token match company:', tokenMatch.name);
        return tokenMatch.name || tokenMatch.company_name || 'Unknown Company';
      }
    }
    
    // Check for primary_company object
    if (customer.primary_company) {
      console.log('Using primary_company object:', customer.primary_company.name);
      return customer.primary_company.name || 'Unknown Company';
    }
    
    // Default to first company in the list
    if (customer.associated_companies && customer.associated_companies.length > 0) {
      console.log('Using first associated company:', customer.associated_companies[0].name);
      return customer.associated_companies[0].name || 
             customer.associated_companies[0].company_name || 
             'Unknown Company';
    }
    
    // Fallback to other company fields
    console.log('Falling back to basic company fields:', customer.company_name || customer.company);
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
