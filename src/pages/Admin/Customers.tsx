
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from "../../hooks/use-toast";
import { Search, UserPlus, Filter, ArrowDownUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerCard from '../../components/ui/customer/CustomerCard';
import CustomerCreateModal from '../../components/ui/customer/CustomerCreateModal';
import { Skeleton } from "../../components/ui/skeleton";

interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  projects?: number;
  avatar?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  users?: any[]; // Define the type for users array
}

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      console.log('Fetching customers data...');
      
      // Use a simpler query without joins or nested selects to avoid RLS recursion
      const { data: customersData, error: customersError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (customersError) {
        console.error('Error details:', customersError);
        throw customersError;
      }
      
      console.log('Customers data received:', customersData);
      
      if (customersData) {
        const formattedCustomers = customersData.map(customer => ({
          id: customer.id,
          name: customer.name,
          company: customer.name,
          email: customer.contact_email || '',
          phone: customer.contact_phone || '',
          status: 'active' as 'active' | 'inactive', 
          projects: 0,
          description: customer.description,
          contact_email: customer.contact_email,
          contact_phone: customer.contact_phone,
          city: customer.city,
          country: customer.country,
          users: [] // Initialize empty users array, we'll fetch this separately if needed
        }));
        
        setCustomers(formattedCustomers);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      
      // Set a detailed error message based on the error type
      if (error.code === '42P17') {
        setErrorMsg('Database policy recursion error. Please contact an administrator.');
      } else if (error.code === '42P01') {
        setErrorMsg('Table not found. Check database configuration.');
      } else if (error.code === '42703') {
        setErrorMsg('Column not found. Check database schema.');
      } else if (error.message) {
        setErrorMsg(`Error: ${error.message}`);
      } else {
        setErrorMsg('Failed to load customers. Please try again.');
      }
      
      toast({
        title: "Error",
        description: errorMsg || "Failed to load customers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
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
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
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
        
        <div className="flex space-x-4">
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
          </div>
          
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ArrowDownUp size={16} className="mr-2" />
              Sort
            </button>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
              <div className="mt-4 pt-4 border-t">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {errorMsg && !loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Customers</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            {errorMsg}
          </p>
          <button 
            onClick={fetchCustomers}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      )}
      
      {!loading && !errorMsg && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
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
      
      {!loading && !errorMsg && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            We couldn't find any customers matching your search criteria. Try adjusting your filters or create a new customer.
          </p>
        </div>
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
