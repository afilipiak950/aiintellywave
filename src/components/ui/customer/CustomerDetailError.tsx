
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface CustomerDetailErrorProps {
  error: string;
  onRetry: () => void;
  onBack?: () => void;
}

const CustomerDetailError = ({ error, onRetry, onBack }: CustomerDetailErrorProps) => {
  // Determine if we should show custom message for known errors
  const errorTitle = error.includes('does not exist') ? 'Customer Not Found' : 
                    error.includes('No customer data found') ? 'Customer Data Missing' :
                    error.includes('missing database records') ? 'Customer Data Missing' :
                    'Error Loading Customer';
  
  // Provide more helpful messages based on error type
  let errorMessage = '';
  let additionalInfo = '';
  
  if (error.includes('does not exist')) {
    errorMessage = 'The customer ID you are trying to access does not exist in the system.';
    additionalInfo = 'The customer may have been deleted or the URL is incorrect.';
  } else if (error.includes('No customer data found') || error.includes('missing database records')) {
    errorMessage = 'The customer exists but no data was found.';
    additionalInfo = 'This could be due to missing database records or insufficient permissions.';
  } else if (error.includes('Error fetching profile')) {
    errorMessage = 'There was a problem retrieving this customer\'s profile data.';
    additionalInfo = 'Check for database connectivity issues or missing tables.';
  } else if (error.includes('infinite recursion') || error.includes('RLS policy')) {
    errorMessage = 'Database access policy error.';
    additionalInfo = 'There may be an issue with row-level security policies. Contact your administrator.';
  } else {
    errorMessage = error;
  }
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">{errorTitle}</h3>
      <p className="text-red-700 mb-2">{errorMessage}</p>
      {additionalInfo && <p className="text-red-600 mb-6 text-sm">{additionalInfo}</p>}
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
