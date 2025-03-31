
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Grid, Search } from 'lucide-react';
import { useCustomers } from '../../hooks/use-customers';
import { useCompaniesWithUsers } from '../../hooks/use-companies-with-users';
import CustomerErrorState from '../../components/ui/customer/CustomerErrorState';
import CustomerLoadingState from '../../components/ui/customer/CustomerLoadingState';
import CustomerList from '../../components/ui/customer/CustomerList';
import CompanyUsersList from '../../components/ui/customer/CompanyUsersList';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddCustomerButton from '@/components/ui/customer/AddCustomerButton';
import { supabase } from '@/integrations/supabase/client';

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
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<'customers' | 'companies'>('customers');
  const navigate = useNavigate();
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  
  // Add more detailed logging
  useEffect(() => {
    console.log('AdminCustomers - Customers data:', customers);
    console.log('AdminCustomers - Companies data:', companies);
    
    // Get current auth user info for debugging
    const fetchAuthInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Current auth user:', user);
          
          // Get session for full details
          const { data: sessionData } = await supabase.auth.getSession();
          console.log('Current session:', sessionData);
          setSessionDetails(sessionData);
          
          // Check roles table
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id);
            
          console.log('User roles:', roleData);
          
          // Check company_users table
          const { data: companyUserData } = await supabase
            .from('company_users')
            .select('*')
            .eq('user_id', user.id);
            
          console.log('Company user data:', companyUserData);
          
          setAuthInfo({
            id: user.id,
            email: user.email,
            role: roleData?.[0]?.role || 'unknown',
            company_role: companyUserData?.[0]?.role || 'unknown',
            is_admin: companyUserData?.[0]?.is_admin || false
          });
        }
      } catch (error) {
        console.error('Error fetching auth info:', error);
      }
    };
    
    fetchAuthInfo();
  }, [customers, companies]);
  
  const handleRetry = () => {
    console.log("Retrying data fetch...");
    if (activeTab === 'customers') {
      fetchCustomers();
    } else {
      fetchCompaniesAndUsers();
    }
  };

  const handleCompanyUpdate = () => {
    // Refresh both data sources to ensure everything is up to date
    console.log("Refreshing customer and company data...");
    fetchCustomers();
    fetchCompaniesAndUsers();
  };
  
  // Determine if we're loading or have an error based on the active tab
  const isLoading = activeTab === 'customers' ? customersLoading : companiesLoading;
  const errorMsg = activeTab === 'customers' ? customersError : companiesError;
  const hasData = (activeTab === 'customers' && customers.length > 0) || 
                  (activeTab === 'companies' && companies.length > 0);
  
  console.log("Current tab:", activeTab);
  console.log("Customer count:", customers.length);
  console.log("Companies count:", companies.length);
  console.log("Is loading:", isLoading);
  console.log("Error:", errorMsg);
  
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
          
          <AddCustomerButton onCustomerCreated={handleCompanyUpdate} />
        </div>
      </div>
      
      {/* Search - only show if we have data and no error */}
      {!isLoading && !errorMsg && hasData && activeTab === 'customers' && (
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
      
      {/* Enhanced Debug Info */}
      <div className="bg-gray-100 p-3 rounded text-xs">
        <p className="font-semibold">Debug Info:</p>
        <p>Total customers loaded: {customers.length}</p>
        <p>Total companies loaded: {companies.length}</p>
        <p>Current User: {authInfo?.email} (Role: {authInfo?.role}, Company Role: {authInfo?.company_role})</p>
        <p>Is Admin: {authInfo?.is_admin ? 'Yes' : 'No'}</p>
        <p>User IDs: {customers.map(c => c.id).join(', ').substring(0, 100)}{customers.length > 3 ? '...' : ''}</p>
        <p>First customer email: {customers[0]?.email || customers[0]?.contact_email || 'None'}</p>
        <p>First customer name: {customers[0]?.name || 'None'}</p>
        <p>Auth Status: {sessionDetails ? 'Authenticated' : 'Not Authenticated'}</p>
        <button 
          onClick={handleRetry}
          className="px-2 py-1 mt-2 bg-blue-500 text-white rounded text-xs"
        >
          Force Refresh Data
        </button>
      </div>
      
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
          {!isLoading && !errorMsg && customers.length > 0 && (
            <CustomerList
              customers={customers}
              searchTerm={searchTerm}
              view={viewMode}
            />
          )}
          
          {!isLoading && !errorMsg && customers.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <h3 className="mt-2 text-lg font-medium text-gray-900">No customers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try refreshing the data using the button above.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="companies">
          {!isLoading && !errorMsg && companies.length > 0 && (
            <CompanyUsersList 
              companies={companies}
              usersByCompany={usersByCompany}
              onCompanyUpdated={handleCompanyUpdate}
            />
          )}
          
          {!isLoading && !errorMsg && companies.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <h3 className="mt-2 text-lg font-medium text-gray-900">No companies found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try refreshing the data using the button above.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCustomers;
