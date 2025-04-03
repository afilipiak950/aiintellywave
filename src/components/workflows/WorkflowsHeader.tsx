
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkflowsHeaderProps {
  onSyncClick: () => void;
  isSyncing: boolean;
}

export const WorkflowsHeader: React.FC<WorkflowsHeaderProps> = ({
  onSyncClick,
  isSyncing
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Workflow Manager</h1>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onSyncClick}
          disabled={isSyncing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync from n8n'}
        </Button>
      </div>
    </div>
  );
};
