
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  // Format the error message to be more user-friendly
  const formattedError = errorMsg.includes("infinite recursion") || errorMsg.includes("Database policy error")
    ? "Database policy error: Wir haben ein Problem mit der Datenzugriffskonfiguration. Unser Team arbeitet an einer Lösung."
    : errorMsg.includes("User not allowed") || errorMsg.includes("permission denied")
    ? "Zugriff verweigert: Sie haben keine Berechtigung, auf diese Kundendaten zuzugreifen."
    : errorMsg.includes("does not exist") 
    ? "Der angeforderte Kunde existiert nicht in der Datenbank oder wurde gelöscht."
    : errorMsg;

  return (
    <CustomerDetailError 
      error={formattedError} 
      onRetry={onRetry}
    />
  );
};

export default CustomerErrorDisplay;
