
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectionStatusType } from '../types';

interface ConnectionStatusAlertProps {
  connectionStatus: ConnectionStatusType;
  checkDatabaseConnection: () => Promise<boolean>;
  handleRetryFetch: () => void;
  isRefreshing: boolean;
}

const ConnectionStatusAlert: React.FC<ConnectionStatusAlertProps> = ({
  connectionStatus,
  checkDatabaseConnection,
  handleRetryFetch,
  isRefreshing
}) => {
  if (connectionStatus !== ConnectionStatusType.ERROR) {
    return null;
  }
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Connection Error</AlertTitle>
      <AlertDescription>
        <p>Failed to connect to the database. This could be due to network issues or database configuration.</p>
        <div className="flex items-center gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkDatabaseConnection}
            disabled={connectionStatus === ConnectionStatusType.CHECKING}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${connectionStatus === ConnectionStatusType.CHECKING ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRetryFetch}
            disabled={isRefreshing || connectionStatus === ConnectionStatusType.CHECKING}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Retry Fetch
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatusAlert;
