
import React, { useState } from 'react';
import WorkflowVisualization from '@/components/workflows/WorkflowVisualization';
import WorkflowSettings from '@/components/workflows/WorkflowSettings';
import WorkflowHeader from '@/components/workflows/WorkflowHeader';
import { useWorkflows } from '@/hooks/use-workflows';

const WorkflowsPage = () => {
  const { workflows, loading, error, triggerWorkflow, refreshWorkflows } = useWorkflows();
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  
  const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId) || null;

  return (
    <div className="space-y-6 p-6 pb-16">
      <WorkflowHeader 
        refreshWorkflows={refreshWorkflows}
        workflowCount={workflows.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <WorkflowSettings 
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            workflows={workflows}
            loading={loading}
            onSelectWorkflow={setSelectedWorkflowId}
            selectedWorkflowId={selectedWorkflowId}
            triggerWorkflow={triggerWorkflow}
          />
        </div>
        
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6 min-h-[500px]">
          {selectedWorkflow ? (
            <WorkflowVisualization 
              workflow={selectedWorkflow}
              loading={loading}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Wählen Sie einen Workflow aus, um ihn zu visualisieren</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowsPage;
