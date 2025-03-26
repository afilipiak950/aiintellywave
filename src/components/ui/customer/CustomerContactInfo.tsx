
import { Mail, Phone, MapPin } from 'lucide-react';
import { Customer } from '@/types/customer';

interface CustomerContactInfoProps {
  customer: Customer;
}

const CustomerContactInfo = ({ customer }: CustomerContactInfoProps) => {
  return (
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
  );
};

export default CustomerContactInfo;
