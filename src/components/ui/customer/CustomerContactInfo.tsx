
import { UICustomer } from '@/types/customer';
import { Mail, Phone, MapPin, Building, Briefcase, Users, Linkedin } from 'lucide-react';

interface CustomerContactInfoProps {
  customer: UICustomer;
}

const CustomerContactInfo = ({ customer }: CustomerContactInfoProps) => {
  const contactItems = [
    { 
      icon: <Mail className="h-5 w-5 text-muted-foreground" />, 
      label: "Email", 
      value: customer.email || customer.contact_email || 'N/A'
    },
    { 
      icon: <Phone className="h-5 w-5 text-muted-foreground" />, 
      label: "Phone", 
      value: customer.phone || customer.contact_phone || 'N/A'
    },
    { 
      icon: <MapPin className="h-5 w-5 text-muted-foreground" />, 
      label: "Address", 
      value: customer.address || 'N/A'
    },
    { 
      icon: <Building className="h-5 w-5 text-muted-foreground" />, 
      label: "Department", 
      value: customer.department || 'N/A'
    },
    { 
      icon: <Briefcase className="h-5 w-5 text-muted-foreground" />, 
      label: "Job Title", 
      value: customer.job_title || customer.position || 'N/A'
    },
    { 
      icon: <Users className="h-5 w-5 text-muted-foreground" />, 
      label: "Company Size", 
      value: customer.company_size ? customer.company_size.toString() : 'N/A'
    },
    { 
      icon: <Linkedin className="h-5 w-5 text-muted-foreground" />, 
      label: "LinkedIn", 
      value: customer.linkedin_url || 'N/A',
      isLink: true
    }
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>
      
      <div className="space-y-3">
        {contactItems.map((item, index) => (
          <div key={index} className="flex items-start">
            <div className="mt-0.5 mr-3">
              {item.icon}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              {item.isLink && item.value !== 'N/A' ? (
                <a 
                  href={item.value.startsWith('http') ? item.value : `https://${item.value}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm">{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerContactInfo;
