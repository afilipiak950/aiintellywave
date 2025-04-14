
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, RefreshCw } from 'lucide-react';
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
  if (searchStringsLength !== 0 || error || connectionStatus === ConnectionStatusType.ERROR) {
    return null;
  }
  
  return (
    <Alert className="mb-6">
      <Database className="h-4 w-4" />
      <AlertTitle>No Search Strings Found</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>No search strings were loaded. This might be due to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>No search strings in the database</li>
            <li>Permission issues with the search_strings table</li>
            <li>Data formatting issues</li>
          </ul>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 flex items-center gap-1" 
            onClick={handleRetryFetch}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmptyStateAlert;
