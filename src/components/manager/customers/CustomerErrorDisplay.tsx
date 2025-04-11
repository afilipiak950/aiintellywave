
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  // Format the error message to be more user-friendly in German
  const formattedError = errorMsg.includes("infinite recursion") || errorMsg.includes("Database policy error")
    ? "Datenbankrichtlinienfehler: Wir haben ein Problem mit der Datenzugriffskonfiguration. Unser Team arbeitet an einer Lösung."
    : errorMsg.includes("User not allowed") || errorMsg.includes("permission denied") || errorMsg.includes("Permission denied")
    ? "Zugriff verweigert: Sie haben keine Berechtigung, auf diese Kundendaten zuzugreifen."
    : errorMsg.includes("does not exist") || errorMsg.includes("not found in any table") || errorMsg.includes("Customer ID does not exist")
    ? "Der angeforderte Kunde existiert nicht in der Datenbank oder wurde gelöscht. Bitte überprüfen Sie die Kunden-ID."
    : errorMsg.includes("No customer data found") || errorMsg.includes("Invalid customer ID")
    ? "Für diesen Kunden wurden keine Daten gefunden. Die Kunden-ID scheint ungültig zu sein oder es gibt ein Berechtigungsproblem."
    : errorMsg.includes("not a valid UUID")
    ? "Die angegebene Kunden-ID ist keine gültige UUID. Bitte verwenden Sie ein korrektes Format wie: 99f4040d-097f-40c6-a533-fde044b03550"
    : errorMsg;

  return (
    <CustomerDetailError 
      error={formattedError} 
      onRetry={onRetry}
    />
  );
};

export default CustomerErrorDisplay;
