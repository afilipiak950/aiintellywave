
import { Search } from 'lucide-react';
import CustomerLoadingState from '../../components/ui/customer/CustomerLoadingState';
import CustomerErrorState from '../../components/ui/customer/CustomerErrorState';
import CustomerList from '../../components/ui/customer/CustomerList';
import { useManagerCustomer } from '../../hooks/use-manager-customer';
import { Customer } from '@/types/customer';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const ManagerCustomers = () => {
  const { 
    customers, 
    loading, 
    errorMsg, 
    searchTerm, 
    setSearchTerm, 
    fetchCustomer 
  } = useManagerCustomer();
  const [view, setView] = useState<'grid' | 'table'>('grid');

  // Convert ManagerCustomer[] to Customer[] to satisfy the CustomerList props
  const formattedCustomers: Customer[] = customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.contact_email,
    phone: customer.contact_phone,
    status: customer.status,
    city: customer.city,
    country: customer.country,
    users: customer.users,
    // Add other required fields with defaults
    company: customer.name, // Using company name as fallback
    role: 'customer', // Default role
  }));

  const handleRetry = () => {
    console.log("Retrying customer data fetch...");
    fetchCustomer();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex space-x-2">
          <Button 
            variant={view === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button 
            variant={view === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setView('table')}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading state */}
      {loading && <CustomerLoadingState />}

      {/* Error state */}
      {!loading && errorMsg && (
        <CustomerErrorState 
          errorMsg={errorMsg} 
          onRetry={handleRetry}
        />
      )}

      {/* Customer List */}
      {!loading && !errorMsg && (
        <CustomerList 
          customers={formattedCustomers} 
          searchTerm={searchTerm}
          view={view}
        />
      )}
    </div>
  );
};

export default ManagerCustomers;
