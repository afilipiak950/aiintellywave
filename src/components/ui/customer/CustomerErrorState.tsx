
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CustomerErrorStateProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorState = ({ errorMsg, onRetry }: CustomerErrorStateProps) => {
  // Format the error message to be more user-friendly
  const formattedError = errorMsg.includes("infinite recursion") || errorMsg.includes("Database policy error")
    ? "Datenbank-Richtlinienfehler: Es gibt ein Problem mit der Konfiguration des Datenzugriffs. Unser Team arbeitet an einer Lösung."
    : errorMsg;

  // Check if it's an RLS issue
  const isRlsError = errorMsg.includes("infinite recursion") || 
                    errorMsg.includes("policy") || 
                    errorMsg.includes("violates row-level security") ||
                    errorMsg.includes("Database policy error");

  // Check if it's a not found issue
  const isNotFoundError = errorMsg.includes("Keine Kundendaten") || 
                         errorMsg.includes("Kunde nicht gefunden") ||
                         errorMsg.includes("No customer data found");

  return (
    <div className="text-center py-12 px-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Fehler beim Laden der Kundendaten</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {formattedError}
      </p>
      
      {isRlsError && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-6 text-sm text-amber-800 mx-auto max-w-md">
          <p className="font-medium">Datenbank-Zugriffsproblem</p>
          <p className="mt-1">Es scheint ein Problem mit den Datenbankberechtigungen zu geben. Bitte überprüfen Sie Ihre Admin-Benutzerrechte oder die Row-Level Security (RLS) Konfiguration.</p>
          <p className="mt-2 text-xs">Fehlerdetails: {errorMsg.includes("infinite recursion") ? "Unendliche Rekursion in der Datenbank-Richtlinie erkannt" : "Verletzung der zeilenbasierten Sicherheit"}</p>
        </div>
      )}
      
      {isNotFoundError && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-6 text-sm text-blue-800 mx-auto max-w-md">
          <p className="font-medium">Debugging-Informationen:</p>
          <p className="mt-1">- Die Kunden-ID scheint nicht in der Datenbank zu existieren</p>
          <p>- Oder der Benutzer ist keiner Firma zugeordnet</p>
          <p>- Oder es gibt Berechtigungsprobleme beim Zugriff auf die Daten</p>
          <p className="mt-1 text-xs">Aktuelle ID: {window.location.pathname.split('/').pop()}</p>
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
