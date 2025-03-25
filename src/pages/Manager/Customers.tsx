
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Search, UserPlus, Filter, ArrowDownUp, Mail, Phone, Edit, Trash } from 'lucide-react';
import { toast } from "../../hooks/use-toast";
import CustomerCard from '../../components/ui/customer/CustomerCard';

interface Customer {
  id: string;
  user_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive';
  projects: number;
}

const ManagerCustomers = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.companyId) return;
      
      try {
        setLoading(true);
        
        // Get company users with role 'customer'
        const { data: companyUsers, error: companyUsersError } = await supabase
          .from('company_users')
          .select(`
            id,
            user_id,
            role
          `)
          .eq('company_id', user.companyId)
          .eq('role', 'customer');
          
        if (companyUsersError) throw companyUsersError;
        
        if (companyUsers && companyUsers.length > 0) {
          // Get user profiles separately
          const userIds = companyUsers.map(cu => cu.user_id);
          
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url, phone, is_active')
            .in('id', userIds);
            
          // Create a map for easy lookup
          const profilesMap = new Map();
          if (profilesData) {
            profilesData.forEach(profile => {
              profilesMap.set(profile.id, profile);
            });
          }
          
          // Count projects for each user
          const customersWithProjects = await Promise.all(
            companyUsers.map(async (cu) => {
              const { count: projectCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', user.companyId);
                
              // Get profile data
              const profile = profilesMap.get(cu.user_id) || {};
              const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User';
              const isActive = profile.is_active === true;
              
              return {
                id: cu.id,
                user_id: cu.user_id,
                name,
                company: 'Your Company', // Replace with actual company name
                email: `user${cu.user_id.substring(0, 4)}@example.com`, // Simulated email
                phone: profile.phone || 'N/A',
                avatar: profile.avatar_url,
                status: isActive ? 'active' as const : 'inactive' as const,
                projects: projectCount || 0
              };
            })
          );
          
          setCustomers(customersWithProjects);
        } else {
          setCustomers([]);
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
    
    fetchCustomers();
  }, [user]);
  
  // Filter and search customers
  const filteredCustomers = customers
    .filter(customer => 
      filter === 'all' || 
      (filter === 'active' && customer.status === 'active') ||
      (filter === 'inactive' && customer.status === 'inactive')
    )
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const handleAddCustomer = () => {
    // Implement the modal to add a new customer
    toast({
      title: "Coming soon",
      description: "Customer creation functionality is coming soon!",
    });
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <button 
          onClick={handleAddCustomer}
          className="btn-primary inline-flex sm:self-end"
        >
          <UserPlus size={18} className="mr-2" />
          Add Team Member
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
            placeholder="Search team members..."
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
      
      {/* Filter Pills */}
      <div className="flex items-center space-x-2">
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'inactive'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('inactive')}
        >
          Inactive
        </button>
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
              onClick={() => console.log('Customer clicked:', customer.id)} 
            />
          ))}
        </div>
      )}
      
      {/* No Results */}
      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-500">
            We couldn't find any team members matching your search criteria. Try adjusting your filters or add new members.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagerCustomers;
