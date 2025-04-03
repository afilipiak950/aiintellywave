
import { UICustomer } from '@/types/customer';
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Building, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CompaniesTableProps {
  companies: UICustomer[];
}

const CompaniesTable = ({ companies }: CompaniesTableProps) => {
  const navigate = useNavigate();

  const handleCompanyClick = (companyId: string) => {
    navigate(`/admin/companies/${companyId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Contact Information</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Users</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow 
              key={company.id}
              onClick={() => handleCompanyClick(company.id)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Building className="h-4 w-4" />
                  </div>
                  <div className="font-medium">{company.name || company.company_name || 'Unnamed Company'}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {(company.contact_email || company.email) && (
                    <div className="text-sm">{company.contact_email || company.email}</div>
                  )}
                  {company.contact_phone && (
                    <div className="text-xs text-muted-foreground">{company.contact_phone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {company.city && company.country 
                  ? `${company.city}, ${company.country}`
                  : company.city || company.country || '-'
                }
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  <Users className="h-3 w-3" />
                  {Array.isArray(company.users) ? company.users.length : 0}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
