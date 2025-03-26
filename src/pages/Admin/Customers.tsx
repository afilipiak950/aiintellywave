
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, List, Grid } from 'lucide-react';
import { useCustomers } from '../../hooks/use-customers';
import CustomerCreateModal from '../../components/ui/customer/CustomerCreateModal';
import CustomerSearch from '../../components/ui/customer/CustomerSearch';
import CustomerErrorState from '../../components/ui/customer/CustomerErrorState';
import CustomerLoadingState from '../../components/ui/customer/CustomerLoadingState';
import CustomerList from '../../components/ui/customer/CustomerList';
import { Button } from '../../components/ui/button';

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex space-x-2">
          <div className="bg-gray-100 rounded-md p-1 flex">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-2"
            >
              <Grid size={18} />
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-2"
            >
              <List size={18} />
            </Button>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary inline-flex sm:self-end"
          >
            <UserPlus size={18} className="mr-2" />
            Add Customer
          </button>
        </div>
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
          view={viewMode}
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
