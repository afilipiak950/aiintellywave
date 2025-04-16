
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectionStatusType } from '../types';

interface EmptyStateAlertProps {
  searchStringsLength: number;
  error: string | null;
  connectionStatus: ConnectionStatusType;
  handleRetryFetch: () => void;
  isRefreshing: boolean;
}

const EmptyStateAlert: React.FC<EmptyStateAlertProps> = ({
  searchStringsLength,
  error,
  connectionStatus,
  handleRetryFetch,
  isRefreshing
}) => {
  // Don't show if we have strings, or if there's already an error displayed
  if (searchStringsLength > 0 || error || connectionStatus === ConnectionStatusType.CHECKING) {
    return null;
  }
  
  return (
    <Alert className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>No Search Strings Found</AlertTitle>
      <AlertDescription>
        {connectionStatus === ConnectionStatusType.ERROR ? (
          <p>Cannot display search strings due to database connection issues.</p>
        ) : (
          <p>
            No search strings were found in the database. 
            This could mean the database is empty or there was an issue with the retrieval.
          </p>
        )}
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRetryFetch}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmptyStateAlert;
