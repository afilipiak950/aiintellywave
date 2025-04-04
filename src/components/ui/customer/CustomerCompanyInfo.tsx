
import { Building2, ExternalLink, Briefcase, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/hooks/customers/types'; 
import { AssociatedCompany } from '@/types/customer';

interface CustomerCompanyInfoProps {
  customer: Customer;
  onEditClick?: () => void;
  readOnly?: boolean;
}

const CustomerCompanyInfo = ({ 
  customer, 
  onEditClick,
  readOnly = false 
}: CustomerCompanyInfoProps) => {
  console.log('[CustomerCompanyInfo] Rendering with customer data:', customer);
  console.log('[CustomerCompanyInfo] Associated companies:', customer.associated_companies);
  
  // First try to find explicitly marked primary company
  let primaryCompany = customer.associated_companies?.find(c => c.is_primary === true);
  
  // If no explicitly marked primary, try email domain matching
  if (!primaryCompany && customer.email && customer.associated_companies?.length) {
    const email = customer.email;
    const emailDomain = email.includes('@') ? email.split('@')[1].toLowerCase() : '';
    const domainPrefix = emailDomain ? emailDomain.split('.')[0].toLowerCase() : '';
    
    if (domainPrefix) {
      primaryCompany = customer.associated_companies.find(c => {
        if (!c.name && !c.company_name) return false;
        const companyName = (c.name || c.company_name || '').toLowerCase();
        return (
          companyName === domainPrefix || 
          companyName.includes(domainPrefix) || 
          domainPrefix.includes(companyName)
        );
      });
      console.log('[CustomerCompanyInfo] Found domain match company:', primaryCompany);
    }
  }
  
  // If still no primary company, use the first one in the list or create a fallback
  if (!primaryCompany) {
    primaryCompany = customer.associated_companies?.[0] || { 
      id: customer.company_id || '', 
      name: customer.company_name || customer.company || '',
      company_id: customer.company_id || '',
      role: customer.company_role || customer.role || 'customer'
    };
    console.log('[CustomerCompanyInfo] Using fallback company:', primaryCompany);
  }
  
  // Get other associated companies (excluding the primary one)
  const otherCompanies = customer.associated_companies?.filter(
    c => c.company_id !== primaryCompany?.company_id
  ) || [];
    
  // Use the primary company info for display
  const displayCompanyName = primaryCompany?.name || primaryCompany?.company_name || 'Unknown Company';
  const companyRole = primaryCompany?.role || customer.company_role || customer.role || 'customer';
  
  const formatWebsite = (website: string | undefined) => {
    if (!website) return '';
    return website.startsWith('http') ? website : `https://${website}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Company Information
        </h3>
        {!readOnly && onEditClick && (
          <Button 
            onClick={onEditClick} 
            variant="outline" 
            size="sm"
          >
            Edit
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-lg font-medium">{displayCompanyName}</p>
          <div className="flex items-center mt-1">
            <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
            <Badge 
              variant={companyRole === 'admin' ? 'destructive' : companyRole === 'manager' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {companyRole}
            </Badge>
            {primaryCompany?.is_primary && (
              <Badge variant="outline" className="ml-2">
                Primary
              </Badge>
            )}
          </div>
        </div>
        
        {(customer.contact_email || customer.email) && (
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            <a 
              href={`mailto:${customer.contact_email || customer.email}`} 
              className="text-sm text-blue-600 hover:underline"
            >
              {customer.contact_email || customer.email}
            </a>
          </div>
        )}
        
        {customer.contact_phone && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">
              {customer.contact_phone}
            </span>
          </div>
        )}
        
        {customer.website && (
          <div className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
            <a 
              href={formatWebsite(customer.website)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {customer.website}
            </a>
          </div>
        )}
        
        {customer.city && customer.country && (
          <div className="text-sm mt-2">
            <span className="text-gray-600">Location:</span>{' '}
            <span>{customer.city}, {customer.country}</span>
          </div>
        )}
      </div>
      
      {/* Show other company associations if any exist */}
      {otherCompanies.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h4 className="text-sm font-medium mb-2">Also associated with:</h4>
          <ul className="space-y-2">
            {otherCompanies.map((company, idx) => (
              <li key={idx} className="text-sm flex items-center">
                <Building2 className="h-3 w-3 mr-2 text-gray-400" />
                <span>{company.name || company.company_name}</span>
                {company.role && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs capitalize"
                  >
                    {company.role}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomerCompanyInfo;
