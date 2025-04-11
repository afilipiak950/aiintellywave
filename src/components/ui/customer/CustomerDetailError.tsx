
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CustomerDetailErrorProps {
  error: string;
  onRetry: () => void;
}

const CustomerDetailError = ({ error, onRetry }: CustomerDetailErrorProps) => {
  const isRlsError = error.includes("infinite recursion") || 
                    error.includes("policy") || 
                    error.includes("violates row-level security") ||
                    error.includes("Database policy error");

  const isNotFoundError = error.includes("No customer data found") || error.includes("not found");

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
      <div className="flex items-start">
        <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
        <div>
          <h3 className="font-medium text-lg mb-2">Fehler beim Laden der Kundendaten</h3>
          <p className="mb-3">{error}</p>

          {isRlsError && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4 text-amber-800 text-sm">
              <p className="font-medium">Datenbank-Zugriffsproblem</p>
              <p className="mt-1">Es scheint ein Problem mit den Datenbankberechtigungen zu geben. Bitte überprüfen Sie Ihre Admin-Benutzerrechte oder die Row-Level Security (RLS) Konfiguration.</p>
            </div>
          )}

          {isNotFoundError && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-4 text-blue-800 text-sm">
              <p className="font-medium">Debugging-Tipps:</p>
              <p className="mt-1">- Überprüfen Sie, ob die ID in der URL mit einer vorhandenen Benutzer-ID übereinstimmt</p>
              <p>- Vergewissern Sie sich, dass der Benutzer in der Datenbank existiert</p>
              <p>- Stellen Sie sicher, dass der Benutzer mit mindestens einem Unternehmen verknüpft ist</p>
              <p className="mt-1">Aktuelle Kunden-ID: {window.location.pathname.split('/').pop()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex space-x-3">
        <Button 
          onClick={onRetry}
          variant="default"
          className="flex items-center"
        >
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
