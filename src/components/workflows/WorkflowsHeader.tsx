
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface WorkflowsHeaderProps {
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
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and assign email campaigns to customers
          </p>
        </div>
        <Button 
          onClick={onRefreshClick} 
          variant="outline" 
          disabled={isRefreshing}
          className="ml-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </Button>
      </div>
      
      {refreshError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error refreshing metrics: {refreshError.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
