import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Search } from 'lucide-react';
import { toast } from "../../hooks/use-toast";

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

      const { data: customersData, error: customersError } = await supabase
        .from('companies')
        .select(`
          *,
          users:company_users(
            user_id,
            profiles(
              id,
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('id', user.companyId);

      if (customersError) throw customersError;

      if (customersData) {
        const formattedCustomers = customersData.map(customer => ({
          id: customer.id,
          name: customer.name,
          contact_email: customer.contact_email || '',
          contact_phone: customer.contact_phone || '',
          city: customer.city || '',
          country: customer.country || '',
          users: customer.users?.map(companyUser => ({
            id: companyUser.user_id,
            email: (companyUser.profiles as any)?.email || 'N/A',
          })) || [],
        }));

        setCustomers(formattedCustomers);
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
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Customer List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-900">{customer.name}</h2>
              <p className="text-gray-500">Email: {customer.contact_email}</p>
              <p className="text-gray-500">Phone: {customer.contact_phone}</p>
              <p className="text-gray-500">
                Location: {customer.city}, {customer.country}
              </p>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Users:</h3>
                {(customer.users as any[])?.map((user: any) => (
                  <div key={user.id} className="text-sm text-gray-500">
                    {user.email}
                  </div>
                ))}
              </div>
            </div>
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
            We couldn't find any customers matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagerCustomers;
