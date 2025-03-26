
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
import CustomerList from '../../components/ui/customer/CustomerList';

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
        <CustomerList
          customers={customers}
          searchTerm={searchTerm}
        />
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
