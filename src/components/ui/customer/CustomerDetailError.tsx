
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface CustomerDetailErrorProps {
  error: string;
  onRetry: () => void;
  onBack?: () => void;
}

const CustomerDetailError = ({ error, onRetry, onBack }: CustomerDetailErrorProps) => {
  // Determine if we should show custom message for known errors
  const errorTitle = error.includes('does not exist') ? 'Customer Not Found' : 'Error Loading Customer';
  
  // Provide more helpful messages based on error type
  const errorMessage = error.includes('does not exist') 
    ? 'The customer ID you are trying to access does not exist in the system. The customer may have been deleted or the URL is incorrect.'
    : error.includes('Error fetching profile') 
      ? 'There was a problem retrieving this customer\'s profile data.'
      : error;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">{errorTitle}</h3>
      <p className="text-red-700 mb-6">{errorMessage}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={onRetry}
          className="flex items-center justify-center gap-2"
        >
          Try Again
        </Button>
        {onBack && (
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            Back to Customers
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailError;
