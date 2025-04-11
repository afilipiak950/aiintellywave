
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  // Format the error message to be more user-friendly in German
  const formatDbErrorMessage = (msg: string) => {
    // Extract UUID from error message if present
    const uuidMatch = msg.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    const customerId = uuidMatch ? uuidMatch[1] : 'Keine ID gefunden';
    
    // Special case for ID not existing
    if (msg.includes("does not exist") || msg.includes("existiert nicht") || msg.includes("nicht gefunden")) {
      return `Die Kunden-ID "${customerId}" konnte nicht in der Datenbank gefunden werden. 
              Bitte vergewissern Sie sich, dass diese ID in einer der Tabellen (profiles, company_users, oder user_roles) existiert.`;
    }
    
    // Original error formatting logic
    if (msg.includes("infinite recursion") || msg.includes("Database policy error")) {
      return "Datenbankrichtlinienfehler: Wir haben ein Problem mit der Datenzugriffskonfiguration. Unser Team arbeitet an einer Lösung.";
    }
    
    if (msg.includes("User not allowed") || msg.includes("permission denied") || msg.includes("Permission denied")) {
      return "Zugriff verweigert: Sie haben keine Berechtigung, auf diese Kundendaten zuzugreifen.";
    }
    
    if (msg.includes("not a valid UUID")) {
      return `Die angegebene Kunden-ID ist keine gültige UUID. Bitte verwenden Sie ein korrektes Format wie: 99f4040d-097f-40c6-a533-fde044b03550`;
    }
    
    if (msg.includes("No customer data found") || msg.includes("Invalid customer ID")) {
      return `Für die ID "${customerId}" wurden keine Kundendaten gefunden. Diese ID scheint ungültig zu sein oder es gibt ein Berechtigungsproblem.`;
    }
    
    return msg;
  };

  const formattedError = formatDbErrorMessage(errorMsg);
  
  // Add debug information to help diagnose the issue
  const debugInfo = (
    <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs text-gray-700 font-mono">
      <p className="mb-1">Debug-Info für Entwickler:</p>
      <p>Aktuelle URL: {window.location.pathname}</p>
      <p>Geprüfte Tabellen: profiles, company_users, user_roles</p>
      <p>Format-Prüfung: UUID must match pattern like: 99f4040d-097f-40c6-a533-fde044b03550</p>
    </div>
  );

  return (
    <>
      <CustomerDetailError 
        error={formattedError} 
        onRetry={onRetry}
      />
      {process.env.NODE_ENV !== 'production' && debugInfo}
    </>
  );
};

export default CustomerErrorDisplay;
