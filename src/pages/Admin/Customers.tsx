import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from "../../hooks/use-toast";
import { Search, UserPlus, Filter, ArrowDownUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerCard from '../../components/ui/customer/CustomerCard';
import CustomerCreateModal from '../../components/ui/customer/CustomerCreateModal';

interface Customer {
  id: string;
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  website: string;
  logo_url: string;
  industry: string;
  users: any[]; // Define the type for users array
}

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const { data: customersData, error: customersError } = await supabase
        .from('companies')
        .select(`
          *,
          users:company_users(user_id, is_admin)
        `)
        .order('created_at', { ascending: false });
        
      if (customersError) throw customersError;
      
      if (customersData) {
        setCustomers(customersData as Customer[]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
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
      customer.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      {/* Search and Filters */}
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
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Customer Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer}
              onClick={() => handleCustomerClick(customer.id)}
            >
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm mb-2 font-medium text-gray-700">Users:</div>
                {customer.users?.map((user: any) => (
                  <div key={user.id} className="text-sm text-gray-500">
                    {user.email}
                  </div>
                ))}
              </div>
            </CustomerCard>
          ))}
        </div>
      )}
      
      {/* No Results */}
      {!loading && filteredCustomers.length === 0 && (
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
      
      {/* Create Customer Modal */}
      <CustomerCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCustomerCreated={fetchCustomers}
      />
    </div>
  );
};

export default AdminCustomers;
