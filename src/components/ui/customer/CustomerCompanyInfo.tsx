
import { UICustomer } from '@/types/customer';
import { Building, MapPin, Mail, Phone, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CustomerCompanyInfoProps {
  customer: UICustomer;
}

const CustomerCompanyInfo = ({ customer }: CustomerCompanyInfoProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <Building className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
          <div>
            <div className="font-medium">{customer.company_name || 'Not specified'}</div>
            {customer.company_role && (
              <Badge variant="outline" className="mt-1">
                {customer.company_role}
              </Badge>
            )}
          </div>
        </div>
        
        {customer.associated_companies && customer.associated_companies.length > 1 && (
          <div className="flex items-start">
            <Building className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <div className="font-medium">Associated Companies</div>
              <div className="mt-1 space-y-2">
                {customer.associated_companies.map((company, index) => (
                  <div key={index} className="text-sm flex items-center space-x-2">
                    <span>{company.name}</span>
                    <Badge variant="outline">{company.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {customer.position && (
          <div className="flex items-start">
            <Briefcase className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Position</div>
              <div>{customer.position}</div>
            </div>
          </div>
        )}
        
        {(customer.city || customer.country) && (
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div>{[customer.city, customer.country].filter(Boolean).join(', ')}</div>
            </div>
          </div>
        )}
        
        {customer.contact_email && (
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Contact Email</div>
              <div>{customer.contact_email}</div>
            </div>
          </div>
        )}
        
        {customer.contact_phone && (
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Contact Phone</div>
              <div>{customer.contact_phone}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCompanyInfo;
