
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, Database, Key, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CustomerErrorStateProps {
  errorMsg: string;
  errorType?: 'policy' | 'not-found' | 'user-not-customer' | 'unknown';
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
                         
  // Check if it's a user-not-customer issue
  const isUserNotCustomerError = errorType === 'user-not-customer' || 
                               (originalError && (
                                 originalError.includes("User ID") || 
                                 originalError.includes("Benutzer-ID") ||
                                 originalError.includes("nicht in customers")
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
      
      {isUserNotCustomerError && (
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-md mb-6 text-sm text-orange-800 mx-auto max-w-md">
          <div className="flex items-center gap-2 font-medium mb-1">
            <User className="h-4 w-4" />
            <p>Benutzer-ID statt Kunden-ID verwendet</p>
          </div>
          <p className="mt-1">Die ID <span className="font-mono">{customerId}</span> existiert in den Benutzer-Tabellen (wie profiles oder company_users), aber nicht in der customers-Tabelle.</p>
          <p className="mt-2 text-sm font-medium">Lösungsvorschläge:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Verwenden Sie eine tatsächliche Kunden-ID aus der customers-Tabelle</li>
            <li>Falls es sich um einen Benutzer handelt, sollten Sie diesen zuerst als Kunden hinzufügen</li>
            <li>Prüfen Sie die URL - bei /admin/customers/ sollten nur IDs aus der customers-Tabelle verwendet werden</li>
          </ul>
        </div>
      )}
      
      {isNotFoundError && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-6 text-sm text-blue-800 mx-auto max-w-md">
          <div className="flex items-center gap-2 font-medium mb-1">
            <Search className="h-4 w-4" />
            <p>Informationen zur Fehlersuche:</p>
          </div>
          <p className="mt-1">Diese ID wurde in keiner relevanten Tabelle (customers, company_users, profiles) gefunden oder es gibt ein Problem mit dem Datenzugriff.</p>
          <p className="mt-2">Häufige Ursachen für diesen Fehler:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Die ID existiert nicht in der Datenbank</li>
            <li>Der Datensatz wurde gelöscht</li>
            <li>Es gibt einen Tippfehler in der ID</li>
          </ul>
          
          {customerId && (
            <div className="mt-3 p-2 bg-white rounded border border-blue-100">
              <p className="font-mono text-xs">Gesuchte ID: {customerId}</p>
              <p className="text-xs mt-1">Diese ID konnte in den relevanten Tabellen nicht gefunden werden.</p>
            </div>
          )}
          
          <div className="mt-3 flex items-start gap-1">
            <Database className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs">Gehen Sie zur Kundenliste und wählen Sie einen gültigen Kunden aus oder erstellen Sie einen neuen Kundeneintrag.</p>
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
        
        <Link to="/admin/customers">
          <Button 
            variant="outline"
            className="w-full sm:w-auto"
          >
            Zurück zur Kundenliste
          </Button>
        </Link>
      </div>
      
      <p className="mt-4 text-sm text-gray-400">
        Wenn das Problem weiterhin besteht, wenden Sie sich bitte an den Support.
      </p>
    </div>
  );
};

export default CustomerErrorState;
