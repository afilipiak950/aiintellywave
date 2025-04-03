
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Workflow Manager</h1>
      <div className="flex items-center gap-4">
        <Button 
          variant={syncError ? "destructive" : "outline"} 
          onClick={onSyncClick}
          disabled={isSyncing}
          title={syncError ? syncError.message : "Sync workflows from n8n"}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : syncError ? 'Retry Sync' : 'Sync from n8n'}
        </Button>
      </div>
    </div>
  );
};
