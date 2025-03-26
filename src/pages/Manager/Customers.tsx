
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Search } from 'lucide-react';
import { toast } from "../../hooks/use-toast";
import CustomerLoadingState from '../../components/ui/customer/CustomerLoadingState';
import CustomerErrorState from '../../components/ui/customer/CustomerErrorState';

interface Customer {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  country: string;
  users?: { id: string; email: string }[];
}

const ManagerCustomers = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    if (!user?.companyId) {
      console.warn('No company ID found for user.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      console.log('Fetching manager customer data for company:', user.companyId);

      // First, fetch the company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, contact_email, contact_phone, city, country')
        .eq('id', user.companyId)
        .maybeSingle();

      if (companyError) {
        console.error('Error fetching company data:', companyError);
        throw companyError;
      }

      if (!companyData) {
        console.warn('No company data found');
        setCustomers([]);
        setLoading(false);
        return;
      }

      console.log('Company data received:', companyData);
      
      // Format the company as a customer
      const customer: Customer = {
        id: companyData.id,
        name: companyData.name,
        contact_email: companyData.contact_email || '',
        contact_phone: companyData.contact_phone || '',
        city: companyData.city || '',
        country: companyData.country || '',
        users: [],
      };

      // Now fetch users in a separate query
      try {
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('user_id')
          .eq('company_id', user.companyId);

        if (userError) {
          console.warn('Error fetching users:', userError);
        } else if (userData && userData.length > 0) {
          // Add user data to the customer
          customer.users = userData.map(user => ({
            id: user.user_id,
            email: user.user_id, // Just use the ID as we don't have email data available
          }));
        }
      } catch (userError) {
        console.warn('Error fetching user data:', userError);
      }

      setCustomers([customer]);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      
      // Set a detailed error message based on the error type
      if (error.code) {
        setErrorMsg(`Database error (${error.code}): ${error.message}`);
      } else if (error.message) {
        setErrorMsg(`Error: ${error.message}`);
      } else {
        setErrorMsg('Failed to load customer data. Please try again.');
      }
      
      toast({
        title: "Error",
        description: errorMsg || "Failed to load customer data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onRetry={fetchCustomers} 
        />
      )}

      {/* Customer List */}
      {!loading && !errorMsg && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-900">{customer.name}</h2>
              <p className="text-gray-500">Email: {customer.contact_email || 'N/A'}</p>
              <p className="text-gray-500">Phone: {customer.contact_phone || 'N/A'}</p>
              <p className="text-gray-500">
                Location: {[customer.city, customer.country].filter(Boolean).join(', ') || 'N/A'}
              </p>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Users:</h3>
                {customer.users && customer.users.length > 0 ? (
                  customer.users.map((user) => (
                    <div key={user.id} className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No users assigned</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !errorMsg && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            We couldn't find any customers matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagerCustomers;
