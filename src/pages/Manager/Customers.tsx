
import { Search } from 'lucide-react';
import CustomerLoadingState from '../../components/ui/customer/CustomerLoadingState';
import CustomerErrorState from '../../components/ui/customer/CustomerErrorState';
import CustomerList from '../../components/ui/customer/CustomerList';
import { useManagerCustomer } from '../../hooks/use-manager-customer';

const ManagerCustomers = () => {
  const { 
    customers, 
    loading, 
    errorMsg, 
    searchTerm, 
    setSearchTerm, 
    fetchCustomer 
  } = useManagerCustomer();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Customers</h1>
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
          onRetry={fetchCustomer} 
        />
      )}

      {/* Customer List */}
      {!loading && !errorMsg && (
        <CustomerList 
          customers={customers} 
          searchTerm={searchTerm}
        />
      )}
    </div>
  );
};

export default ManagerCustomers;
