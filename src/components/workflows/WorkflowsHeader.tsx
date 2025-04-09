
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WorkflowsHeaderProps {
  onRefreshClick: () => void;
  isRefreshing: boolean;
  refreshError: Error | null;
}

export const WorkflowsHeader: React.FC<WorkflowsHeaderProps> = ({
  onRefreshClick,
  isRefreshing,
  refreshError
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Manage and share workflows
          </p>
        </div>
        <Button 
          onClick={onRefreshClick} 
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Workflows'}
        </Button>
      </div>
      
      {refreshError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Refresh failed</AlertTitle>
          <AlertDescription>
            {refreshError.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
