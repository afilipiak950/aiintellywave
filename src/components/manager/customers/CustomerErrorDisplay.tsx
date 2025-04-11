
import CustomerErrorState from '@/components/ui/customer/CustomerErrorState';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  console.log('CustomerErrorDisplay: Fehler anzeigen:', errorMsg);
  
  // Format the error message to be more user-friendly
  let formattedError = errorMsg;
  let errorType = 'unknown';
  
  if (errorMsg.includes("infinite recursion") || errorMsg.includes("Database policy error")) {
    formattedError = "Datenbank-Richtlinienfehler: Es gibt ein Problem mit der Datenzugriffskonfiguration. Unser Team arbeitet an einer Lösung.";
    errorType = 'policy';
  } else if (errorMsg.includes("No customer data found for this ID")) {
    formattedError = "Kein Kundendatensatz gefunden: Die angegebene ID existiert nicht in der Datenbank oder Sie haben keine Berechtigung, diesen Datensatz anzusehen.";
    errorType = 'not-found';
  }

  return (
    <CustomerErrorState 
      errorMsg={formattedError} 
      errorType={errorType}
      originalError={errorMsg}
      customerId={window.location.pathname.split('/').pop()}
      onRetry={onRetry}
    />
  );
};

export default CustomerErrorDisplay;
