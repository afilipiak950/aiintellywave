
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Workflow } from '@/types/workflow';
import { Loader2, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WorkflowSettingsProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  workflows: Workflow[];
  loading: boolean;
  onSelectWorkflow: (id: string | null) => void;
  selectedWorkflowId: string | null;
  triggerWorkflow: (url: string, workflowId: string) => Promise<boolean>;
}

const WorkflowSettings = ({
  webhookUrl,
  setWebhookUrl,
  workflows,
  loading,
  onSelectWorkflow,
  selectedWorkflowId,
  triggerWorkflow,
}: WorkflowSettingsProps) => {
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTriggerWorkflow = async () => {
    if (!webhookUrl) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Webhook-URL ein",
        variant: "destructive",
      });
      return;
    }

    if (!selectedWorkflowId) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Workflow aus",
        variant: "destructive",
      });
      return;
    }

    setIsTriggering(true);
    try {
      const success = await triggerWorkflow(webhookUrl, selectedWorkflowId);
      if (success) {
        toast({
          title: "Erfolg",
          description: "Workflow wurde ausgelöst",
        });
      } else {
        toast({
          title: "Fehler",
          description: "Fehler beim Auslösen des Workflows",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Auslösen des Workflows",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Workflow-Einstellungen</h2>
      
      <div className="space-y-2">
        <Label htmlFor="webhook-url">N8N Webhook URL</Label>
        <Input
          id="webhook-url"
          placeholder="https://n8n.example.com/webhook/..."
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Geben Sie die N8N Webhook-URL ein, um Workflows zu triggern
        </p>
      </div>

      <div className="space-y-2">
        <Label>Verfügbare Workflows</Label>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : workflows.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedWorkflowId === workflow.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => onSelectWorkflow(workflow.id)}
              >
                <div className="font-medium">{workflow.name}</div>
                {workflow.description && (
                  <div className="text-xs text-gray-500">{workflow.description}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Keine Workflows verfügbar</p>
        )}
      </div>

      <Button
        disabled={isTriggering || !webhookUrl || !selectedWorkflowId}
        onClick={handleTriggerWorkflow}
        className="w-full"
      >
        {isTriggering ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird ausgelöst...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" /> Workflow auslösen
          </>
        )}
      </Button>
    </Card>
  );
};

export default WorkflowSettings;
