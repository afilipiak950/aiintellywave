
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserData {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_admin?: boolean;
  companies?: {
    id?: string;
    name?: string;
  };
  company_id?: string;
}

interface CustomersTableViewProps {
  users: UserData[];
  getCompanyName: (user: UserData) => string;
}

const CustomersTableView = ({ users, getCompanyName }: CustomersTableViewProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Company</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">
                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
              </TableCell>
              <TableCell>{user.email || '-'}</TableCell>
              <TableCell>
                <Badge 
                  variant={user.is_admin ? "default" : "outline"}
                  className="capitalize"
                >
                  {user.role || 'customer'}
                </Badge>
              </TableCell>
              <TableCell>{getCompanyName(user)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomersTableView;
