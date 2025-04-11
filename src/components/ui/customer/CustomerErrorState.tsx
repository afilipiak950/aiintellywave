
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, Database, Key } from 'lucide-react';

interface CustomerErrorStateProps {
  errorMsg: string;
  errorType?: 'policy' | 'not-found' | 'unknown';
  originalError?: string;
  customerId?: string;
  onRetry: () => void;
}

const CustomerErrorState = ({ 
  errorMsg, 
  errorType = 'unknown',
  originalError,
  customerId,
  onRetry 
}: CustomerErrorStateProps) => {
  // Check if it's an RLS issue
  const isRlsError = errorType === 'policy' || 
                    (originalError && (
                      originalError.includes("infinite recursion") || 
                      originalError.includes("policy") || 
                      originalError.includes("violates row-level security") ||
                      originalError.includes("Database policy error")
                    ));

  // Check if it's a not found issue
  const isNotFoundError = errorType === 'not-found' || 
                         (originalError && (
                           originalError.includes("Keine Kundendaten") || 
                           originalError.includes("Kunde nicht gefunden") ||
                           originalError.includes("No customer data found")
                         ));
                         
  return (
    <div className="text-center py-12 px-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Fehler beim Laden der Kundendaten</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {errorMsg}
      </p>
      
      {isRlsError && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-6 text-sm text-amber-800 mx-auto max-w-md">
          <div className="flex items-center gap-2 font-medium mb-1">
            <Key className="h-4 w-4" />
            <p>Datenbank-Zugriffsproblem</p>
          </div>
          <p className="mt-1">Es scheint ein Problem mit den Datenbankberechtigungen zu geben. Bitte überprüfen Sie Ihre Admin-Benutzerrechte oder die Row-Level Security (RLS) Konfiguration.</p>
          <p className="mt-2 text-xs">Fehlerdetails: {originalError?.includes("infinite recursion") ? "Unendliche Rekursion in der Datenbank-Richtlinie erkannt" : "Verletzung der zeilenbasierten Sicherheit"}</p>
        </div>
      )}
      
      {isNotFoundError && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-6 text-sm text-blue-800 mx-auto max-w-md">
          <div className="flex items-center gap-2 font-medium mb-1">
            <Bug className="h-4 w-4" />
            <p>Debugging-Informationen:</p>
          </div>
          <p className="mt-1">- Die Kunden-ID scheint nicht in der Datenbank zu existieren</p>
          <p>- Oder der Benutzer ist keiner Firma zugeordnet</p>
          <p>- Oder es gibt Berechtigungsprobleme beim Zugriff auf die Daten</p>
          
          {customerId && (
            <div className="mt-2 p-2 bg-white rounded border border-blue-100">
              <p className="font-mono text-xs">Aktuelle ID: {customerId}</p>
              <p className="text-xs mt-1">Bitte prüfen Sie, ob diese ID in den Tabellen profiles, company_users oder user_roles existiert.</p>
            </div>
          )}
          
          <div className="mt-2 flex items-start gap-1">
            <Database className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs">Diese ID sollte mindestens in einer der folgenden Tabellen vorhanden sein: auth.users, profiles, company_users, oder user_roles.</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button 
          onClick={onRetry}
          variant="default"
          className="inline-flex items-center font-medium w-full sm:w-auto"
        >
          Erneut versuchen
        </Button>
        
        <Button 
          onClick={() => window.location.href = '/admin/customers'}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Zurück zur Kundenliste
        </Button>
      </div>
      
      <p className="mt-4 text-sm text-gray-400">
        Wenn das Problem weiterhin besteht, wenden Sie sich bitte an den Support.
      </p>
    </div>
  );
};

export default CustomerErrorState;
