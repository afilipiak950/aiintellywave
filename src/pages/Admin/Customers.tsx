
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useCustomers } from '../../hooks/use-customers';
import CustomerCard from '../../components/ui/customer/CustomerCard';
import CustomerCreateModal from '../../components/ui/customer/CustomerCreateModal';
import CustomerSearch from '../../components/ui/customer/CustomerSearch';
import CustomerEmptyState from '../../components/ui/customer/CustomerEmptyState';
import CustomerErrorState from '../../components/ui/customer/CustomerErrorState';
import CustomerLoadingState from '../../components/ui/customer/CustomerLoadingState';

const AdminCustomers = () => {
  const { 
    customers, 
    loading, 
    errorMsg, 
    searchTerm, 
    setSearchTerm, 
    fetchCustomers 
  } = useCustomers();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleCustomerClick = (customerId: string) => {
    navigate(`/admin/customers/${customerId}`);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary inline-flex sm:self-end"
        >
          <UserPlus size={18} className="mr-2" />
          Add Customer
        </button>
      </div>
      
      <CustomerSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {loading && <CustomerLoadingState />}
      
      {errorMsg && !loading && (
        <CustomerErrorState 
          errorMsg={errorMsg} 
          onRetry={fetchCustomers} 
        />
      )}
      
      {!loading && !errorMsg && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer}
              onClick={() => handleCustomerClick(customer.id)}
            >
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm mb-2 font-medium text-gray-700">Users:</div>
                {customer.users?.length > 0 ? (
                  customer.users.map((user: any) => (
                    <div key={user.user_id} className="text-sm text-gray-500">
                      {user.email || user.user_id}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No users assigned</div>
                )}
              </div>
            </CustomerCard>
          ))}
        </div>
      )}
      
      {!loading && !errorMsg && customers.length === 0 && (
        <CustomerEmptyState searchTerm={searchTerm} />
      )}
      
      <CustomerCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCustomerCreated={fetchCustomers}
      />
    </div>
  );
};

export default AdminCustomers;
