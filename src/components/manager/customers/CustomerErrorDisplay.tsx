
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
      errorMsg.includes("policy")) {
    formattedError = "Database access error: There may be an issue with the data access configuration. Our team has been notified.";
    errorType = 'policy';
  } else if (errorMsg.includes("No customer found") || 
             errorMsg.includes("not found")) {
    formattedError = "Customer not found: The specified ID does not exist in the database.";
    errorType = 'not-found';
  } else if (errorMsg.includes("User ID exists in auth") || 
             errorMsg.includes("not associated with a customer")) {
    formattedError = "This ID belongs to a user account but is not associated with a customer record in our system.";
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
