
import { UICustomer } from '@/types/customer';
import { Building, Mail, Phone, MapPin, Globe, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CompanyCardProps {
  company: UICustomer;
  onClick?: () => void;
  children?: React.ReactNode;
}

const CompanyCard = ({ company, onClick, children }: CompanyCardProps) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium">{company.name || company.company_name || 'Unnamed Company'}</h3>
            {company.city && company.country && (
              <p className="text-sm text-muted-foreground">{company.city}, {company.country}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {(company.contact_email || company.email) && (
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm">{company.contact_email || company.email}</span>
            </div>
          )}
          
          {company.contact_phone && (
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm">{company.contact_phone}</span>
            </div>
          )}
          
          {company.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm">{company.address}</span>
            </div>
          )}
          
          {company.website && (
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <a 
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                className="text-sm text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
              >
                {company.website}
              </a>
            </div>
          )}
          
          {Array.isArray(company.users) && company.users.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm">{company.users.length} Associated Users</span>
            </div>
          )}
          
          {company.description && (
            <div className="pt-2 mt-2 border-t">
              <p className="text-sm text-gray-600">{company.description}</p>
            </div>
          )}
        </div>
        
        {children}
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
