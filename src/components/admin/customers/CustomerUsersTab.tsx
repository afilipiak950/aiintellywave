
import { User, RefreshCw } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CustomerLoadingState from "@/components/ui/customer/CustomerLoadingState";

interface CustomerUsersTabProps {
  users: any[];
  loading: boolean;
  errorMsg: string | null;
  searchTerm: string;
  view: 'grid' | 'table';
  onRetry: () => void;
  onRepair: () => Promise<void>;
  isRepairing: boolean;
}

const CustomerUsersTab = ({ 
  users, 
  loading, 
  errorMsg, 
  searchTerm, 
  view,
  onRetry,
  onRepair,
  isRepairing
}: CustomerUsersTabProps) => {
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (user.email?.toLowerCase().includes(search)) ||
      (user.full_name?.toLowerCase().includes(search)) ||
      (user.first_name?.toLowerCase().includes(search)) ||
      (user.last_name?.toLowerCase().includes(search)) ||
      (user.companies?.name?.toLowerCase().includes(search))
    );
  });

  // Helper to get user's name
  const getUserName = (user: any) => {
    if (user.full_name) return user.full_name;
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return 'Unnamed User';
  };

  // Helper to get company name
  const getCompanyName = (user: any) => {
    if (user.companies && user.companies.name) {
      return user.companies.name;
    }
    return 'Unknown Company';
  };

  // Loading state
  if (loading) {
    return <CustomerLoadingState />;
  }

  // Error state
  if (errorMsg) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Fehler beim Laden der Benutzer</h3>
        <p className="text-red-700 text-sm mt-1">{errorMsg}</p>
        <Button 
          onClick={onRetry} 
          variant="destructive"
          size="sm" 
          className="mt-3"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Erneut versuchen
        </Button>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Benutzer gefunden</h3>
        <p className="text-gray-500 mb-4">
          Es wurden keine Benutzer gefunden oder Sie haben keine Berechtigung, diese anzuzeigen.
        </p>
        <Button onClick={onRepair} disabled={isRepairing}>
          {isRepairing ? 'Repariere...' : 'Benutzer-Zuordnungen reparieren'}
        </Button>
      </div>
    );
  }

  // No search results
  if (filteredUsers.length === 0 && searchTerm) {
    return (
      <div className="text-center py-10 border rounded-md">
        <h3 className="text-lg font-medium">Keine Ergebnisse für "{searchTerm}"</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Versuchen Sie es mit einem anderen Suchbegriff oder löschen Sie den Suchtext.
        </p>
      </div>
    );
  }

  // Grid view
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <Card key={user.user_id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user.first_name ? user.first_name[0] : user.email ? user.email[0] : 'U'}
                </div>
                <div>
                  {getUserName(user)}
                  <div className="text-xs font-normal text-muted-foreground mt-1">
                    {user.email}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Rolle:</span>
                  <Badge 
                    variant={user.is_admin ? "default" : "outline"}
                    className="capitalize"
                  >
                    {user.role || 'customer'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Unternehmen:</span>
                  <span>{getCompanyName(user)}</span>
                </div>
                {user.last_sign_in_at && (
                  <div className="flex justify-between">
                    <span className="font-medium">Letzte Anmeldung:</span>
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
  }

  // Table view
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rolle</TableHead>
            <TableHead>Unternehmen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map(user => (
            <TableRow key={user.user_id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">{getUserName(user)}</TableCell>
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

export default CustomerUsersTab;
