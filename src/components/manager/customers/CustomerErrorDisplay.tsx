
import CustomerErrorState from '@/components/ui/customer/CustomerErrorState';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  console.log('CustomerErrorDisplay: Displaying error:', errorMsg);
  
  // Extract the current customer ID from the URL
  const customerId = window.location.pathname.split('/').pop();
  
  // Determine the error type and provide a user-friendly message
  let formattedError = errorMsg;
  let errorType: 'policy' | 'not-found' | 'user-not-customer' | 'unknown' = 'unknown';
  
  if (errorMsg.includes("infinite recursion") || 
      errorMsg.includes("Database access error") || 
      errorMsg.includes("permission denied") ||
      errorMsg.includes("policy") ||
      errorMsg.includes("violates row-level security")) {
    formattedError = "Database-Zugangsfehler: Es gibt möglicherweise ein Problem mit den Datenbankberechtigungen. Unser Team wurde benachrichtigt.";
    errorType = 'policy';
  } else if (errorMsg.includes("No customer found") || 
             errorMsg.includes("not found") ||
             errorMsg.includes("Kunde nicht gefunden") ||
             errorMsg.includes("existiert nicht")) {
    formattedError = "Kunde nicht gefunden: Die angegebene ID existiert nicht in der Datenbank.";
    errorType = 'not-found';
  } else if (errorMsg.includes("User ID exists in auth") || 
             errorMsg.includes("not associated with a customer")) {
    formattedError = "Diese ID gehört zu einem Benutzerkonto, ist aber nicht mit einem Kundendatensatz in unserem System verknüpft.";
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
