
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useCustomers } from '@/hooks/customers/use-customers';
import { useAdminRepair } from '@/hooks/customers/use-admin-repair';
import { Customer as CustomerListType } from '@/types/customer';
import CustomerHeader from '@/components/admin/customers/CustomerHeader';
import CustomerStatusPanel from '@/components/admin/customers/CustomerStatusPanel';
import CustomerSearchBar from '@/components/admin/customers/CustomerSearchBar';
import CustomerContent from '@/components/admin/customers/CustomerContent';
import CustomerDebugInfo from '@/components/admin/customers/CustomerDebugInfo';

const Customers = () => {
  const { user } = useAuth();
  const { 
    customers, 
    loading, 
    errorMsg, 
    fetchCustomers, 
    debugInfo, 
    searchTerm, 
    setSearchTerm 
  } = useCustomers();
  
  const {
    isRepairing,
    isRepairingCompanyUsers,
    handleUserRoleRepair,
    handleCompanyUsersRepair
  } = useAdminRepair(fetchCustomers);
  
  const [view, setView] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  // Format customers to match the expected type in CustomerList
  const formattedCustomers: CustomerListType[] = customers.map(customer => ({
    ...customer,
    status: customer.status === 'inactive' ? 'inactive' : 'active'
  }));

  return (
    <div className="p-4 space-y-6">
      <CustomerHeader 
        view={view}
        onViewChange={setView}
        onRefresh={fetchCustomers}
        loading={loading}
      />
      
      {/* Status panel */}
      <CustomerStatusPanel 
        loading={loading}
        errorMsg={errorMsg}
        customerCount={customers.length}
        companyUsersCount={debugInfo?.companyUsersCount || 0}
        onRepairAdmin={handleUserRoleRepair}
        isRepairing={isRepairing}
      />

      {/* Search - only show if we have data */}
      {!loading && !errorMsg && customers.length > 0 && (
        <CustomerSearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}
      
      {/* Customer content area */}
      <CustomerContent 
        loading={loading}
        errorMsg={errorMsg}
        customers={formattedCustomers}
        searchTerm={searchTerm}
        view={view}
        onRetry={fetchCustomers}
        onRepair={handleCompanyUsersRepair}
        isRepairing={isRepairingCompanyUsers}
      />
      
      {/* Debug info at the bottom */}
      <div className="mt-8">
        <details>
          <summary className="cursor-pointer font-medium text-gray-700 p-2 border rounded hover:bg-gray-50">
            Show Debug Information
          </summary>
          <CustomerDebugInfo 
            debugInfo={debugInfo}
            onRepairCompanyUsers={handleCompanyUsersRepair}
            isRepairingCompanyUsers={isRepairingCompanyUsers}
          />
        </details>
      </div>
    </div>
  );
};

export default Customers;
