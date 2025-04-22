
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadDatabaseErrorProps {
  error: Error | string;
  retryCount: number;
  onRetry: () => void;
  isRetrying: boolean;
}

const LeadDatabaseError: React.FC<LeadDatabaseErrorProps> = ({
  error,
  retryCount,
  onRetry,
  isRetrying
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Detect error types to show specific guidance
  const isRlsError = errorMessage.includes('infinite recursion') || 
                    errorMessage.includes('policy');
  const isNetworkError = errorMessage.includes('network') || 
                         errorMessage.includes('fetch') ||
                         errorMessage.includes('connection');
  const isPermissionError = errorMessage.includes('permission') || 
                           errorMessage.includes('access') ||
                           errorMessage.includes('not authorized');

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        Lead Fetch Error
      </AlertTitle>
      
      <AlertDescription className="pt-2">
        <div className="text-sm space-y-2">
          <p className="font-medium">{errorMessage}</p>
          
          {isRlsError && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800 mt-2">
              <p className="flex items-center gap-1 font-medium mb-1">
                <ShieldAlert className="h-4 w-4" />
                Database Security Policy Error
              </p>
              <p className="text-sm">
                This is likely due to a Row Level Security (RLS) configuration issue. 
                The system is attempting alternate methods to load your leads.
              </p>
            </div>
          )}
          
          {isNetworkError && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded text-blue-800 mt-2">
              <p className="flex items-center gap-1 font-medium mb-1">
                <Info className="h-4 w-4" />
                Network Connectivity Issue
              </p>
              <p className="text-sm">
                There may be a problem with your internet connection or the server is currently unavailable.
              </p>
            </div>
          )}
          
          {isPermissionError && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 mt-2">
              <p className="flex items-center gap-1 font-medium mb-1">
                <ShieldAlert className="h-4 w-4" />
                Permission Issue
              </p>
              <p className="text-sm">
                You may not have the necessary permissions to access these leads. 
                Please contact your administrator.
              </p>
            </div>
          )}
          
          {retryCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Retry attempts: {retryCount}
            </p>
          )}
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} /> 
            {isRetrying ? 'Retrying...' : 'Retry Now'}
          </Button>
          
          <Button
            variant="link"
            size="sm"
            className="text-gray-500"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default LeadDatabaseError;
