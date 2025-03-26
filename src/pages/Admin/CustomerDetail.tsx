
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { Customer } from '@/hooks/use-customers';
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Briefcase 
} from 'lucide-react';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        // Fetch company user data
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select(`
            role,
            is_admin,
            companies:company_id (
              id,
              name,
              description,
              contact_email,
              contact_phone,
              city,
              country
            )
          `)
          .eq('user_id', customerId)
          .single();
          
        if (companyUserError && !companyUserError.message.includes('No rows found')) {
          throw companyUserError;
        }
        
        // Get auth user data for email (needs admin access)
        // This might not work depending on RLS policies
        
        // Combine the data
        const company = companyUserData?.companies || {};
        
        const customerData: Customer = {
          id: profileData.id,
          name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unnamed User',
          email: '',
          phone: profileData.phone || '',
          status: profileData.is_active ? 'active' : 'inactive',
          avatar: profileData.avatar_url,
          position: profileData.position || '',
          company: company.name || '',
          company_id: company.id,
          company_name: company.name,
          company_role: companyUserData?.role || '',
          city: company.city,
          country: company.country,
          contact_email: company.contact_email,
          contact_phone: company.contact_phone
        };
        
        setCustomer(customerData);
      } catch (error: any) {
        console.error('Error fetching customer details:', error);
        setError(error.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="mr-4">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Loading Customer Details...</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8">
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="mr-4">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Customer Details</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error || 'Customer not found'}
        </div>
        <button 
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="mr-4">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Customer Details</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {customer.avatar ? (
                <img 
                  src={customer.avatar} 
                  alt={customer.name} 
                  className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border-4 border-gray-200">
                  <User size={40} />
                </div>
              )}
            </div>
            
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              
              <div className="mt-2 text-gray-600">
                {customer.company_role && (
                  <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                    <span className="capitalize">{customer.company_role}</span>
                  </div>
                )}
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${customer.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'}`}
                >
                  {customer.status === 'active' ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex">
                  <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-800">Email</div>
                    <div>{customer.email || customer.contact_email || 'No email available'}</div>
                  </div>
                </div>
                
                <div className="flex">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-800">Phone</div>
                    <div>{customer.phone || customer.contact_phone || 'No phone available'}</div>
                  </div>
                </div>
                
                {(customer.city || customer.country) && (
                  <div className="flex">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-800">Location</div>
                      <div>
                        {[customer.city, customer.country].filter(Boolean).join(', ') || 'Location not available'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Company Information</h3>
              
              <div className="space-y-4">
                <div className="flex">
                  <Building className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-800">Company</div>
                    <div>{customer.company_name || 'No company available'}</div>
                  </div>
                </div>
                
                {customer.position && (
                  <div className="flex">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-800">Position</div>
                      <div>{customer.position}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
