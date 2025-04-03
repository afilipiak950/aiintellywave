
import { useState, useEffect, useCallback } from 'react';
import { Workflow } from '@/types/workflow';
import { toast } from './use-toast';

// Demo-Workflows für die Anzeige
const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Kundendaten-Export',
    description: 'Exportiert Kundendaten in eine CSV-Datei und sendet diese per E-Mail',
    active: true,
    lastExecuted: '2023-10-15T14:25:00Z',
    nodes: [
      { id: 'node-1', name: 'Webhook', description: 'HTTP Request empfangen', type: 'trigger', status: 'success' },
      { id: 'node-2', name: 'API Request', description: 'Kundendaten abrufen', type: 'action', status: 'success' },
      { id: 'node-3', name: 'CSV erstellen', description: 'Daten in CSV-Format konvertieren', type: 'action', status: 'success' },
      { id: 'node-4', name: 'E-Mail senden', description: 'CSV als Anhang senden', type: 'action', status: 'success' }
    ],
    connections: [
      { from: 'node-1', to: 'node-2' },
      { from: 'node-2', to: 'node-3' },
      { from: 'node-3', to: 'node-4' }
    ]
  },
  {
    id: 'workflow-2',
    name: 'Terminbestätigung',
    description: 'Sendet eine Bestätigung per SMS nach Terminbuchung',
    active: true,
    lastExecuted: '2023-10-16T09:12:00Z',
    nodes: [
      { id: 'node-1', name: 'Webhook', description: 'Neue Terminanfrage', type: 'trigger', status: 'success' },
      { id: 'node-2', name: 'Kalender prüfen', description: 'Verfügbarkeit prüfen', type: 'action', status: 'success' },
      { id: 'node-3', name: 'SMS senden', description: 'Bestätigung senden', type: 'action', status: 'error' }
    ],
    connections: [
      { from: 'node-1', to: 'node-2' },
      { from: 'node-2', to: 'node-3' }
    ]
  },
  {
    id: 'workflow-3',
    name: 'Lead-Qualifizierung',
    description: 'Automatische Bewertung neuer Leads basierend auf Kriterien',
    active: false,
    lastExecuted: '2023-10-14T16:45:00Z',
    nodes: [
      { id: 'node-1', name: 'Neuer Lead', description: 'Lead-Eingabe via Formular', type: 'trigger', status: 'success' },
      { id: 'node-2', name: 'Daten validieren', description: 'E-Mail und Telefon prüfen', type: 'action', status: 'success' },
      { id: 'node-3', name: 'Score berechnen', description: 'Lead-Score berechnen', type: 'action', status: 'success' },
      { id: 'node-4', name: 'CRM aktualisieren', description: 'Lead ins CRM eintragen', type: 'action', status: 'success' },
      { id: 'node-5', name: 'E-Mail an Vertrieb', description: 'Bei hohem Score', type: 'action', status: 'success' }
    ],
    connections: [
      { from: 'node-1', to: 'node-2' },
      { from: 'node-2', to: 'node-3' },
      { from: 'node-3', to: 'node-4' },
      { from: 'node-3', to: 'node-5', label: 'Score > 80', status: 'active' }
    ]
  }
];

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // In einer echten Implementierung würden wir hier die N8N API aufrufen
      // Simuliere einen API-Aufruf mit einer Verzögerung
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verwende Demo-Workflows
      setWorkflows(DEMO_WORKFLOWS);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError('Fehler beim Laden der Workflows. Bitte versuchen Sie es später erneut.');
      toast({
        title: "Fehler",
        description: "Die Workflows konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const triggerWorkflow = async (webhookUrl: string, workflowId: string): Promise<boolean> => {
    if (!webhookUrl) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Webhook-URL ein",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log(`Triggering workflow with ID ${workflowId} at URL ${webhookUrl}`);
      
      // In einer echten Implementierung würden wir hier den Webhook aufrufen
      // Hier simulieren wir einen erfolgreichen Aufruf
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return true;
    } catch (error) {
      console.error("Error triggering workflow:", error);
      return false;
    }
  };

  const refreshWorkflows = () => {
    fetchWorkflows();
  };

  return {
    workflows,
    loading,
    error,
    triggerWorkflow,
    refreshWorkflows
  };
};
