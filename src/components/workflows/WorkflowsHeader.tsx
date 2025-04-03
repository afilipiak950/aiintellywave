
import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkflowsHeaderProps {
  onSyncClick: () => void;
  isSyncing: boolean;
  syncError?: Error | null;
}

export const WorkflowsHeader: React.FC<WorkflowsHeaderProps> = ({
  onSyncClick,
  isSyncing,
  syncError
}) => {
  // Determine if error is related to edge function connection
  const isEdgeFunctionError = syncError?.message?.includes("Edge Function") || 
                            syncError?.message?.includes("Failed to send");
  
  // Create a more detailed error message for tooltips
  const errorDetails = isEdgeFunctionError 
    ? "The application cannot connect to the Edge Function. This might be due to authentication issues or Edge Function configuration problems."
    : syncError?.message || "Unknown error occurred";
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Workflow Manager</h1>
      <div className="flex items-center gap-4">
        {syncError && (
          <div className="text-destructive text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Sync failed</span>
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={syncError ? "destructive" : "outline"} 
              onClick={onSyncClick}
              disabled={isSyncing}
              className="relative"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : syncError ? 'Retry Sync' : 'Sync from n8n'}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            {syncError 
              ? <p>{errorDetails}</p> 
              : <p>Synchronize workflows from your n8n instance</p>
            }
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
