
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, Database, Key, RefreshCw } from 'lucide-react';

interface CustomerDetailErrorProps {
  error: string;
  onRetry: () => void;
}

const CustomerDetailError = ({ error, onRetry }: CustomerDetailErrorProps) => {
  const isRlsError = error.includes("infinite recursion") || 
                    error.includes("policy") || 
                    error.includes("violates row-level security") ||
                    error.includes("Database policy error");

  const isNotFoundError = error.includes("No customer data found") || 
                         error.includes("not found") ||
                         error.includes("Keine Kundendaten") ||
                         error.includes("Kunde nicht gefunden");
                         
  const customerId = window.location.pathname.split('/').pop();

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
      <div className="flex items-start">
        <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
        <div>
          <h3 className="font-medium text-lg mb-2">Fehler beim Laden der Kundendaten</h3>
          <p className="mb-3">{error}</p>

          {isRlsError && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4 text-amber-800 text-sm">
              <div className="flex items-center gap-2 font-medium mb-1">
                <Key className="h-4 w-4" />
                <p>Datenbank-Zugriffsproblem</p>
              </div>
              <p className="mt-1">Es scheint ein Problem mit den Datenbankberechtigungen zu geben. Bitte überprüfen Sie Ihre Admin-Benutzerrechte oder die Row-Level Security (RLS) Konfiguration.</p>
            </div>
          )}

          {isNotFoundError && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-4 text-blue-800 text-sm">
              <div className="flex items-center gap-2 font-medium mb-1">
                <Bug className="h-4 w-4" />
                <p>Debugging-Tipps:</p>
              </div>
              <p className="mt-1">- Überprüfen Sie, ob die ID in der URL mit einer vorhandenen Benutzer-ID übereinstimmt</p>
              <p>- Vergewissern Sie sich, dass der Benutzer in der Datenbank existiert</p>
              <p>- Stellen Sie sicher, dass der Benutzer mit mindestens einem Unternehmen verknüpft ist</p>
              
              {customerId && (
                <div className="mt-2 p-2 bg-white rounded border border-blue-100">
                  <p className="font-mono text-xs">Aktuelle Kunden-ID: {customerId}</p>
                  <p className="text-xs mt-1">Bitte prüfen Sie, ob diese ID in den Tabellen profiles, company_users oder user_roles existiert.</p>
                </div>
              )}
              
              <div className="mt-2 flex items-start gap-1">
                <Database className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs">Diese ID sollte mindestens in einer der folgenden Tabellen vorhanden sein: auth.users, profiles, company_users, oder user_roles.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex space-x-3">
        <Button 
          onClick={onRetry}
          variant="default"
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Erneut versuchen
        </Button>
        <Button 
          onClick={() => window.location.href = '/admin/customers'}
          variant="outline"
        >
          Zurück zur Kundenliste
        </Button>
      </div>
    </div>
  );
};

export default CustomerDetailError;
