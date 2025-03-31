
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserData {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_admin?: boolean;
  avatar_url?: string;
  last_sign_in_at?: string;
  companies?: {
    id?: string;
    name?: string;
  };
  company_id?: string;
}

interface CustomersGridViewProps {
  users: UserData[];
  getCompanyName: (user: UserData) => string;
}

const CustomersGridView = ({ users, getCompanyName }: CustomersGridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map(user => (
        <Card key={user.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {user.first_name ? user.first_name[0] : user.email ? user.email[0] : 'U'}
              </div>
              <div>
                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
                <div className="text-xs font-normal text-muted-foreground mt-1">
                  {user.email}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <Badge 
                  variant={user.is_admin ? "default" : "outline"}
                  className="capitalize"
                >
                  {user.role || 'customer'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Company:</span>
                <span>{getCompanyName(user)}</span>
              </div>
              {user.last_sign_in_at && (
                <div className="flex justify-between">
                  <span className="font-medium">Last Sign In:</span>
                  <span>
                    {new Date(user.last_sign_in_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomersGridView;
