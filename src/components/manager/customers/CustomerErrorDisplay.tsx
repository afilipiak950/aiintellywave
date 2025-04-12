
import CustomerErrorState from '@/components/ui/customer/CustomerErrorState';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  console.log('CustomerErrorDisplay: Fehler anzeigen:', errorMsg);
  
  // Format the error message to be more user-friendly
  let formattedError = errorMsg;
  let errorType: 'policy' | 'not-found' | 'user-not-customer' | 'unknown' = 'unknown';
  
  if (errorMsg.includes("infinite recursion") || errorMsg.includes("Database policy error")) {
    formattedError = "Datenbank-Richtlinienfehler: Es gibt ein Problem mit der Datenzugriffskonfiguration. Unser Team arbeitet an einer Lösung.";
    errorType = 'policy';
  } else if (errorMsg.includes("Kunde nicht gefunden") || errorMsg.includes("No customer data found")) {
    formattedError = "Kunde nicht gefunden: Die ID existiert nicht in der Datenbank oder entspricht keinem Kundeneintrag. Bitte überprüfen Sie, ob die ID tatsächlich zu einem Eintrag in der customers-Tabelle gehört.";
    errorType = 'not-found';
  } else if (errorMsg.includes("User ID") || errorMsg.includes("Benutzer-ID") || errorMsg.includes("nicht in customers")) {
    formattedError = "Benutzer-ID statt Kunden-ID: Die ID gehört zu einem Benutzer, nicht zu einem Kunden. Sie müssen eine gültige Kunden-ID aus der customers-Tabelle verwenden.";
    errorType = 'user-not-customer';
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
