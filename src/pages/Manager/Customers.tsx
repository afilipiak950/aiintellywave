
import { useState } from 'react';
import { useManagerCustomers } from '@/hooks/use-manager-customers';
import CustomerViewSelector from '@/components/manager/customers/CustomerViewSelector';
import CustomerSearchBar from '@/components/manager/customers/CustomerSearchBar';
import CustomerContent from '@/components/manager/customers/CustomerContent';

const ManagerCustomers = () => {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const {
    customers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchCustomers,
    isRepairing,
    repairCustomerAssociations
  } = useManagerCustomers();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Kunden</h1>
        <CustomerViewSelector view={view} setView={setView} />
      </div>

      {/* Search - only show if we have data or are loading */}
      {(!loading || !error) && (
        <CustomerSearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          customersCount={customers.length}
        />
      )}

      {/* Customer Content */}
      <CustomerContent
        loading={loading}
        error={error}
        customers={customers}
        searchTerm={searchTerm}
        view={view}
        onRetry={fetchCustomers}
        onRepair={repairCustomerAssociations}
        isRepairing={isRepairing}
      />
    </div>
  );
};

export default ManagerCustomers;
