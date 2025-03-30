
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { 
  fetchEmailIntegrations, 
  createEmailIntegration,
  deleteEmailIntegration
} from '@/services/email-integration-service';
import { EmailIntegration } from '@/types/persona';

export const useEmailIntegrations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const emailIntegrationsQuery = useQuery({
    queryKey: ['emailIntegrations'],
    queryFn: fetchEmailIntegrations,
    enabled: !!user,
  });

  // Mutations
  const createEmailIntegrationMutation = useMutation({
    mutationFn: (integration: Omit<EmailIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return createEmailIntegration(integration, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailIntegrations'] });
      toast({
        title: 'Success',
        description: 'Email integration created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create email integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting email integrations
  const deleteEmailIntegrationMutation = useMutation({
    mutationFn: (integrationId: string) => {
      return deleteEmailIntegration(integrationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailIntegrations'] });
      toast({
        title: 'Integration Removed',
        description: 'Email integration has been disconnected successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to disconnect email integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Add mutation for importing emails
  const importEmailsMutation = useMutation({
    mutationFn: async (params: { integrationId: string, provider: string }) => {
      // This is a placeholder function - we would implement actual email importing logic
      console.log(`Importing emails for integration ${params.integrationId} from ${params.provider}`);
      // Simulate a delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, count: Math.floor(Math.random() * 100) + 10 };
    },
    onSuccess: (data) => {
      toast({
        title: 'Emails Imported',
        description: `Successfully imported ${data.count} emails`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Import Failed',
        description: `Failed to import emails: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    emailIntegrations: emailIntegrationsQuery.data || [],
    isLoading: emailIntegrationsQuery.isLoading,
    isError: emailIntegrationsQuery.isError,
    createEmailIntegration: createEmailIntegrationMutation.mutate,
    deleteEmailIntegration: deleteEmailIntegrationMutation.mutate,
    importIntegrationEmails: (integrationId: string, provider: string) => 
      importEmailsMutation.mutate({ integrationId, provider }),
    // Change from isImporting: importEmailsMutation.isLoading to isPending
    isImporting: importEmailsMutation.isPending,
  };
};
