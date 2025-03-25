
import { User, Mail, Phone, Building, MoreVertical, MapPin } from 'lucide-react';

interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    contact_email?: string;
    contact_phone?: string;
    city?: string;
    country?: string;
    description?: string;
    logo_url?: string;
    website?: string;
    industry?: string;
    users?: any[];
  };
  onClick?: () => void;
  children?: React.ReactNode;
}

const CustomerCard = ({ customer, onClick, children }: CustomerCardProps) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex space-x-4">
          <div className="relative">
            {customer.logo_url ? (
              <img 
                src={customer.logo_url} 
                alt={customer.name} 
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={28} />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">{customer.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Building size={14} className="mr-1" />
              <span>{customer.industry || 'No industry specified'}</span>
            </div>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="mt-5 space-y-2">
        {customer.contact_email && (
          <div className="flex items-center text-sm">
            <Mail size={14} className="text-gray-400 mr-2" />
            <span>{customer.contact_email}</span>
          </div>
        )}
        
        {customer.contact_phone && (
          <div className="flex items-center text-sm">
            <Phone size={14} className="text-gray-400 mr-2" />
            <span>{customer.contact_phone}</span>
          </div>
        )}
        
        {(customer.city || customer.country) && (
          <div className="flex items-center text-sm">
            <MapPin size={14} className="text-gray-400 mr-2" />
            <span>
              {[customer.city, customer.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
};

export default CustomerCard;
