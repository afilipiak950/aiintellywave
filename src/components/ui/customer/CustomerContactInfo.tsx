
import { Mail, Phone, MapPin, User } from 'lucide-react';
import { Customer } from '@/types/customer';

interface CustomerContactInfoProps {
  customer: Customer;
}

const CustomerContactInfo = ({ customer }: CustomerContactInfoProps) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-sm text-gray-600">
              {customer.email || customer.contact_email || 'No email available'}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-700">Phone</p>
            <p className="text-sm text-gray-600">
              {customer.phone || customer.contact_phone || 'No phone available'}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-700">Location</p>
            <p className="text-sm text-gray-600">
              {[customer.city, customer.country].filter(Boolean).join(', ') || 'No location available'}
            </p>
          </div>
        </div>
        
        {customer.position && (
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-700">Position</p>
              <p className="text-sm text-gray-600">{customer.position}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerContactInfo;
