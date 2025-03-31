
import { Users } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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

interface CompaniesTableViewProps {
  companies: CompanyData[];
  getUserCount: (companyId: string) => number;
}

const CompaniesTableView = ({ companies, getUserCount }: CompaniesTableViewProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Users</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map(company => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name || 'Unnamed Company'}</TableCell>
              <TableCell>
                <div>
                  {company.contact_email && (
                    <div className="text-sm">{company.contact_email}</div>
                  )}
                  {company.contact_phone && (
                    <div className="text-xs text-muted-foreground">{company.contact_phone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {[company.city, company.country].filter(Boolean).join(', ') || '-'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  <Users className="h-3 w-3" />
                  {getUserCount(company.id)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTableView;
