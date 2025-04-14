
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectionStatusType } from '../types';

interface ConnectionStatusAlertProps {
  connectionStatus: ConnectionStatusType;
  refreshConnection: () => void;
  // Added this prop to match what's being passed in SearchStringsList.tsx
  checkDatabaseConnection?: () => Promise<boolean>;
  // Added this prop to match what's being passed in SearchStringsList.tsx
  handleRetryFetch?: () => void;
  // Added this prop to match what's being passed in SearchStringsList.tsx
  isRefreshing?: boolean;
}

const ConnectionStatusAlert: React.FC<ConnectionStatusAlertProps> = ({
  connectionStatus,
  refreshConnection,
  checkDatabaseConnection,
  handleRetryFetch,
  isRefreshing,
}) => {
  // Use the appropriate refresh function based on what's provided
  const handleRefresh = () => {
    if (handleRetryFetch) {
      handleRetryFetch();
    } else if (checkDatabaseConnection) {
      checkDatabaseConnection();
    } else {
      refreshConnection();
    }
  };

  if (connectionStatus === ConnectionStatusType.CONNECTED) {
    return null;
  }

  return (
    <Alert 
      variant={connectionStatus === ConnectionStatusType.ERROR ? "destructive" : "default"} 
      className="mb-6"
    >
      <Database className="h-4 w-4" />
      <AlertTitle>
        {connectionStatus === ConnectionStatusType.CHECKING ? "Checking Database Connection" : "Database Connection Error"}
      </AlertTitle>
      <AlertDescription>
        {connectionStatus === ConnectionStatusType.CHECKING ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> 
            Verifying database connection...
          </div>
        ) : (
          <div>
            <p>Could not connect to the database. Please try refreshing the connection.</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="mt-2 flex items-center gap-1"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Connection
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatusAlert;
