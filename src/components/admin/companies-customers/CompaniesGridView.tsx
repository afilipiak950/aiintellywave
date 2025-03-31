
import { Building, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CompanyData {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
}

interface CompaniesGridViewProps {
  companies: CompanyData[];
  getUserCount: (companyId: string) => number;
}

const CompaniesGridView = ({ companies, getUserCount }: CompaniesGridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map(company => (
        <Card key={company.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {company.name || 'Unnamed Company'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.description && (
              <p className="text-sm text-muted-foreground mb-2">{company.description}</p>
            )}
            <div className="space-y-1 text-sm">
              {company.contact_email && (
                <p><span className="font-medium">Email:</span> {company.contact_email}</p>
              )}
              {company.contact_phone && (
                <p><span className="font-medium">Phone:</span> {company.contact_phone}</p>
              )}
              {(company.city || company.country) && (
                <p><span className="font-medium">Location:</span> {[company.city, company.country].filter(Boolean).join(', ')}</p>
              )}
            </div>
            
            {/* Company users count */}
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {getUserCount(company.id)} Users
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CompaniesGridView;
