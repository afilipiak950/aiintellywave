
import CustomerErrorState from '@/components/ui/customer/CustomerErrorState';

interface CustomerErrorDisplayProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorDisplay = ({ errorMsg, onRetry }: CustomerErrorDisplayProps) => {
  // Format the error message to be more user-friendly
  const formattedError = errorMsg.includes("infinite recursion") || errorMsg.includes("Database policy error")
    ? "Database policy error: Wir haben ein Problem mit der Datenzugriffskonfiguration. Unser Team arbeitet an einer Lösung."
    : errorMsg;

  return (
    <CustomerErrorState 
      errorMsg={formattedError} 
      onRetry={onRetry}
    />
  );
};

export default CustomerErrorDisplay;
