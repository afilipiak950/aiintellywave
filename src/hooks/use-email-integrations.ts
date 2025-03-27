
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { 
  fetchEmailIntegrations, 
  createEmailIntegration 
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
    suspense: false, // Disable suspense mode
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
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create email integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    emailIntegrations: emailIntegrationsQuery.data || [],
    isLoading: emailIntegrationsQuery.isLoading,
    isError: emailIntegrationsQuery.isError,
    createEmailIntegration: createEmailIntegrationMutation.mutate,
  };
};
