
import { Building, Briefcase, Users } from 'lucide-react';
import { Customer } from '@/types/customer';

interface CustomerCompanyInfoProps {
  customer: Customer;
}

const CustomerCompanyInfo = ({ customer }: CustomerCompanyInfoProps) => {
  return (
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
        
        {customer.company_role && (
          <div className="flex">
            <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">Role</div>
              <div className="capitalize">{customer.company_role}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCompanyInfo;
