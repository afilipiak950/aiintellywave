
import CustomerErrorState from '@/components/ui/customer/CustomerErrorState';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  console.log('CustomerErrorDisplay: Fehler anzeigen:', errorMsg);
  
  // Extract the current customer ID from the URL
  const customerId = window.location.pathname.split('/').pop();
  
  // Format the error message to be more user-friendly
  let formattedError = errorMsg;
  let errorType: 'policy' | 'not-found' | 'user-not-customer' | 'unknown' = 'unknown';
  
  // Determine the error type
  if (errorMsg.includes("infinite recursion") || errorMsg.includes("Database policy error")) {
    formattedError = "Datenbank-Richtlinienfehler: Es gibt ein Problem mit der Datenzugriffskonfiguration. Unser Team arbeitet an einer Lösung.";
    errorType = 'policy';
  } else if (errorMsg.includes("Kunde nicht gefunden") || errorMsg.includes("No customer data found")) {
    formattedError = "Kunde nicht gefunden: Die angegebene ID existiert möglicherweise nicht in der Datenbank. Bitte überprüfen Sie die ID.";
    errorType = 'not-found';
  } else if (errorMsg.includes("User ID") || errorMsg.includes("Benutzer-ID") || errorMsg.includes("nicht in customers")) {
    formattedError = "Die angegebene ID gehört möglicherweise zu einem Benutzer, nicht zu einem Kunden in der customers-Tabelle.";
    errorType = 'user-not-customer';
  }

  return (
    <CustomerErrorState 
      errorMsg={formattedError} 
      errorType={errorType}
      originalError={errorMsg}
      customerId={customerId}
      onRetry={onRetry}
    />
  );
};

export default CustomerErrorDisplay;
