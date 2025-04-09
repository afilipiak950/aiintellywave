
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold">Email Campaigns</h1>
        <p className="text-muted-foreground mt-1">Manage and assign email campaigns from Instantly.ai</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefreshClick} 
          disabled={isRefreshing}
          className="flex items-center"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </Button>
      </div>
    </div>
  );
};
