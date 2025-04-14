
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  error: string | null;
  handleRetryFetch: () => void;
  isRefreshing: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, handleRetryFetch, isRefreshing }) => {
  if (!error) {
    return null;
  }
  
  // Format the error message to be more user-friendly
  const formatErrorMessage = (error: string) => {
    if (error.includes('Edge Function error')) {
      return 'Server processing error. Please try again later.';
    }
    if (error.includes('non-2xx status code')) {
      return 'Unable to connect to server. Please try again later or contact support.';
    }
    return error;
  };
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Search Strings</AlertTitle>
      <AlertDescription>
        {formatErrorMessage(error)}
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRetryFetch}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Retry Loading
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
