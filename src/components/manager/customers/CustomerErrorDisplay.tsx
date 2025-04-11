
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  // Format the error message to be more user-friendly and provide better German translations
  const formattedError = errorMsg.includes("infinite recursion") || errorMsg.includes("Database policy error")
    ? "Datenbank-Policy-Fehler: Wir haben ein Problem mit der Datenzugriffskonfiguration. Unser Team arbeitet an einer Lösung."
    : errorMsg.includes("No customer data found for this ID")
    ? "Kunde nicht gefunden: Die Kundendaten mit dieser ID wurden nicht in unserer Datenbank gefunden. Bitte überprüfen Sie die ID oder ob der Kunde existiert."
    : errorMsg;

  return (
    <CustomerDetailError 
      error={formattedError} 
      onRetry={onRetry}
    />
  );
};

export default CustomerErrorDisplay;
