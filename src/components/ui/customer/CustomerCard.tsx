
import { User, Mail, Phone, Building, MoreVertical, MapPin, Briefcase, UserCheck } from 'lucide-react';

interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    position?: string;
    contact_email?: string;
    contact_phone?: string;
    city?: string;
    country?: string;
    description?: string;
    logo_url?: string;
    website?: string;
    industry?: string;
    users?: any[];
    company?: string;
    company_name?: string;
    company_role?: string;
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
            {customer.avatar ? (
              <img 
                src={customer.avatar} 
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
              {customer.role && (
                <>
                  <UserCheck size={14} className="mr-1" />
                  <span className="capitalize">{customer.role}</span>
                </>
              )}
              {!customer.role && customer.position && (
                <>
                  <Briefcase size={14} className="mr-1" />
                  <span>{customer.position}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="mt-5 space-y-2">
        {customer.email && (
          <div className="flex items-center text-sm">
            <Mail size={14} className="text-gray-400 mr-2" />
            <span>{customer.email}</span>
          </div>
        )}
        
        {customer.phone && (
          <div className="flex items-center text-sm">
            <Phone size={14} className="text-gray-400 mr-2" />
            <span>{customer.phone}</span>
          </div>
        )}
        
        {customer.company_name && (
          <div className="flex items-center text-sm">
            <Building size={14} className="text-gray-400 mr-2" />
            <span>{customer.company_name}</span>
          </div>
        )}
        
        {customer.position && (
          <div className="flex items-center text-sm">
            <Briefcase size={14} className="text-gray-400 mr-2" />
            <span>{customer.position}</span>
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
