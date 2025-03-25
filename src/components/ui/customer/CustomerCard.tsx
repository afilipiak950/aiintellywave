
import { User, Mail, Phone, Building, MoreVertical } from 'lucide-react';

interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    avatar?: string;
    status: 'active' | 'inactive';
    projects: number;
  };
  onClick?: () => void;
}

const CustomerCard = ({ customer, onClick }: CustomerCardProps) => {
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
            
            <span 
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                customer.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">{customer.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Building size={14} className="mr-1" />
              <span>{customer.company}</span>
            </div>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="mt-5 space-y-2">
        <div className="flex items-center text-sm">
          <Mail size={14} className="text-gray-400 mr-2" />
          <span>{customer.email}</span>
        </div>
        <div className="flex items-center text-sm">
          <Phone size={14} className="text-gray-400 mr-2" />
          <span>{customer.phone}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Projects</span>
          <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded">
            {customer.projects}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
