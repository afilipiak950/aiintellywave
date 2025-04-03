
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface WorkflowHeaderProps {
  refreshWorkflows: () => void;
  workflowCount: number;
}

const WorkflowHeader = ({ refreshWorkflows, workflowCount }: WorkflowHeaderProps) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">N8N Workflow Integration</h1>
        <Button variant="outline" onClick={refreshWorkflows} size="sm">
          <RefreshCw className="h-4 w-4 mr-1" />
          Aktualisieren
        </Button>
      </div>
      <p className="text-gray-500">
        Visualisieren und steuern Sie Ihre N8N Workflows ({workflowCount} verfügbar)
      </p>
    </div>
  );
};

export default WorkflowHeader;
