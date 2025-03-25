
import { useState } from 'react';
import { Search, UserPlus, Filter, ArrowDownUp } from 'lucide-react';
import CustomerCard from '../../components/ui/customer/CustomerCard';

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Mock customer data
  const customers = [
    {
      id: '1',
      name: 'John Doe',
      company: 'Acme Corporation',
      email: 'john@acme.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://i.pravatar.cc/150?u=1',
      status: 'active' as const,
      projects: 5,
    },
    {
      id: '2',
      name: 'Jane Smith',
      company: 'XYZ Enterprises',
      email: 'jane@xyz.com',
      phone: '+1 (555) 987-6543',
      avatar: 'https://i.pravatar.cc/150?u=2',
      status: 'active' as const,
      projects: 3,
    },
    {
      id: '3',
      name: 'Michael Johnson',
      company: 'Global Industries',
      email: 'michael@global.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://i.pravatar.cc/150?u=3',
      status: 'inactive' as const,
      projects: 2,
    },
    {
      id: '4',
      name: 'Emily Brown',
      company: 'Tech Solutions',
      email: 'emily@techsolutions.com',
      phone: '+1 (555) 789-0123',
      avatar: 'https://i.pravatar.cc/150?u=4',
      status: 'active' as const,
      projects: 4,
    },
    {
      id: '5',
      name: 'David Wilson',
      company: 'Innovate LLC',
      email: 'david@innovate.com',
      phone: '+1 (555) 234-5678',
      avatar: 'https://i.pravatar.cc/150?u=5',
      status: 'inactive' as const,
      projects: 0,
    },
    {
      id: '6',
      name: 'Sarah Thompson',
      company: 'Creative Designs',
      email: 'sarah@creative.com',
      phone: '+1 (555) 345-6789',
      avatar: 'https://i.pravatar.cc/150?u=6',
      status: 'active' as const,
      projects: 6,
    },
  ];
  
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
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button className="btn-primary inline-flex sm:self-end">
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
      
      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} onClick={() => console.log('Customer clicked:', customer.id)} />
        ))}
      </div>
      
      {/* No Results */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            We couldn't find any customers matching your search criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
