
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
          <h1 className="text-2xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and assign campaigns from Instantly.ai
          </p>
        </div>
        <Button 
          onClick={onRefreshClick} 
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </Button>
      </div>
      
      {refreshError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to refresh metrics: {refreshError.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
