
import { usePersonas } from '@/hooks/use-personas';
import { EmailIntegration } from '@/types/persona';
import { toast } from '@/hooks/use-toast';

export function useIntegrationActions() {
  const { deleteEmailIntegration } = usePersonas();

  const handleImportEmails = async (integration: EmailIntegration) => {
    try {
      // For now, we'll just show a toast since the function isn't implemented yet
      toast({
        title: 'Import Feature',
        description: `Email import will be implemented soon.`,
      });
    } catch (error: any) {
      console.error('Error importing emails:', error);
      toast({
        title: 'Import Error',
        description: `Failed to import emails: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = (integration: EmailIntegration) => {
    deleteEmailIntegration(integration.id);
  };

  return {
    handleImportEmails,
    handleDisconnect,
  };
}
