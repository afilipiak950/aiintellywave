import { UICustomer } from '@/types/customer';
import { Building, MapPin, Mail, Phone, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CustomerCompanyInfoProps {
  customer: UICustomer;
}

const CustomerCompanyInfo = ({ customer }: CustomerCompanyInfoProps) => {
  // Enhanced function to find the primary company that better matches email domain
  const findPrimaryCompany = () => {
    if (!customer.email || !customer.associated_companies?.length) {
      return {
        name: customer.company_name || '',
        role: customer.company_role || ''
      };
    }
    
    // Extract the domain part from email
    const emailDomain = customer.email.split('@')[1];
    
    if (emailDomain) {
      // First try exact domain match (after the @ symbol)
      const exactDomainMatch = customer.associated_companies.find(
        company => emailDomain.toLowerCase() === company.name.toLowerCase() || 
                  emailDomain.toLowerCase().includes(company.name.toLowerCase()) ||
                  company.name.toLowerCase().includes(emailDomain.split('.')[0].toLowerCase())
      );
      
      if (exactDomainMatch) {
        return {
          name: exactDomainMatch.name,
          role: exactDomainMatch.role
        };
      }
    }
    
    // If no domain match found, prefer admin role
    const adminCompany = customer.associated_companies.find(
      company => company.role === 'admin'
    );
    
    if (adminCompany) {
      return {
        name: adminCompany.name,
        role: adminCompany.role
      };
    }
    
    // Fallback to first company in the list
    return {
      name: customer.associated_companies[0].name,
      role: customer.associated_companies[0].role
    };
  };
  
  // Get primary company info
  const primaryCompany = findPrimaryCompany();
  const primaryCompanyName = primaryCompany.name || customer.company_name;
  const primaryCompanyRole = primaryCompany.role || customer.company_role;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <Building className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
          <div>
            <div className="font-medium">{primaryCompanyName || 'Not specified'}</div>
            {primaryCompanyRole && (
              <Badge variant="outline" className="mt-1">
                {primaryCompanyRole}
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
                {customer.associated_companies
                  .filter(company => company.name !== primaryCompanyName)
                  .map((company, index) => (
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
