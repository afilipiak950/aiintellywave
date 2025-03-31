
import { Building, RefreshCw } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerLoadingState from "@/components/ui/customer/CustomerLoadingState";

interface CustomerCompaniesTabProps {
  companies: any[];
  loading: boolean;
  errorMsg: string | null;
  searchTerm: string;
  view: 'grid' | 'table';
  onRetry: () => void;
}

const CustomerCompaniesTab = ({ 
  companies, 
  loading, 
  errorMsg, 
  searchTerm, 
  view,
  onRetry 
}: CustomerCompaniesTabProps) => {
  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (company.name?.toLowerCase().includes(search)) ||
      (company.description?.toLowerCase().includes(search)) ||
      (company.contact_email?.toLowerCase().includes(search)) ||
      (company.city?.toLowerCase().includes(search)) ||
      (company.country?.toLowerCase().includes(search))
    );
  });

  // Loading state
  if (loading) {
    return <CustomerLoadingState />;
  }

  // Error state
  if (errorMsg) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Fehler beim Laden der Unternehmen</h3>
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
  if (companies.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <Building className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-medium mt-3">Keine Unternehmen gefunden</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Es wurden keine Unternehmen gefunden oder sie haben keine Berechtigung, diese anzuzeigen.
        </p>
      </div>
    );
  }

  // No search results
  if (filteredCompanies.length === 0 && searchTerm) {
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
        {filteredCompanies.map(company => (
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
                  <p><span className="font-medium">Telefon:</span> {company.contact_phone}</p>
                )}
                {(company.city || company.country) && (
                  <p><span className="font-medium">Standort:</span> {[company.city, company.country].filter(Boolean).join(', ')}</p>
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
            <TableHead>Kontakt</TableHead>
            <TableHead>Standort</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCompanies.map(company => (
            <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50">
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerCompaniesTab;
