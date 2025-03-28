
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, List, Grid, Search } from 'lucide-react';
import { useCustomers } from '../../hooks/use-customers';
import { useCompaniesWithUsers } from '../../hooks/use-companies-with-users';
import CustomerCreateModal from '../../components/ui/customer/CustomerCreateModal';
import CustomerErrorState from '../../components/ui/customer/CustomerErrorState';
import CustomerLoadingState from '../../components/ui/customer/CustomerLoadingState';
import CustomerList from '../../components/ui/customer/CustomerList';
import CompanyUsersList from '../../components/ui/customer/CompanyUsersList';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminCustomers = () => {
  // Individual customers view
  const { 
    customers, 
    loading: customersLoading, 
    errorMsg: customersError, 
    searchTerm, 
    setSearchTerm, 
    fetchCustomers 
  } = useCustomers();
  
  // Companies with users view
  const {
    companies,
    usersByCompany,
    loading: companiesLoading,
    errorMsg: companiesError,
    fetchCompaniesAndUsers
  } = useCompaniesWithUsers();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<'customers' | 'companies'>('customers');
  const navigate = useNavigate();
  
  const handleRetry = () => {
    if (activeTab === 'customers') {
      fetchCustomers();
    } else {
      fetchCompaniesAndUsers();
    }
  };

  const handleCompanyUpdate = () => {
    // Refresh both data sources to ensure everything is up to date
    fetchCustomers();
    fetchCompaniesAndUsers();
  };
  
  // Determine if we're loading or have an error based on the active tab
  const isLoading = activeTab === 'customers' ? customersLoading : companiesLoading;
  const errorMsg = activeTab === 'customers' ? customersError : companiesError;
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex space-x-2">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'customers' | 'companies')}
            className="mr-2"
          >
            <TabsList>
              <TabsTrigger value="customers">Individual Customers</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeTab === 'customers' && (
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
          )}
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary inline-flex sm:self-end"
          >
            <UserPlus size={18} className="mr-2" />
            Add Customer
          </button>
        </div>
      </div>
      
      {/* Search - only show for customers tab */}
      {activeTab === 'customers' && (
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
      )}
      
      {/* Loading state */}
      {isLoading && <CustomerLoadingState />}
      
      {/* Error state */}
      {errorMsg && !isLoading && (
        <CustomerErrorState 
          errorMsg={errorMsg} 
          onRetry={handleRetry} 
        />
      )}
      
      {/* Content based on active tab */}
      <Tabs value={activeTab} className="mt-0">
        <TabsContent value="customers">
          {!isLoading && !errorMsg && (
            <CustomerList
              customers={customers}
              searchTerm={searchTerm}
              view={viewMode}
            />
          )}
        </TabsContent>
        
        <TabsContent value="companies">
          {!isLoading && !errorMsg && (
            <CompanyUsersList 
              companies={companies}
              usersByCompany={usersByCompany}
              onCompanyUpdated={handleCompanyUpdate}
            />
          )}
        </TabsContent>
      </Tabs>
      
      <CustomerCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCustomerCreated={() => {
          fetchCustomers();
          fetchCompaniesAndUsers();
        }}
      />
    </div>
  );
};

export default AdminCustomers;
