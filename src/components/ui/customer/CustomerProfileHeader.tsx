
import { User } from 'lucide-react';
import { UICustomer } from '@/types/customer';

interface CustomerProfileHeaderProps {
  customer: UICustomer;
}

const CustomerProfileHeader = ({ customer }: CustomerProfileHeaderProps) => {
  return (
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
  );
};

export default CustomerProfileHeader;
