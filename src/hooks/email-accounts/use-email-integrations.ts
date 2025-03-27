
import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { EmailIntegration } from '@/types/persona';
import { toast } from 'sonner';
import { 
  fetchEmailIntegrations, 
  createEmailIntegration, 
  deleteEmailIntegration 
} from '@/services/email-integration-service';
import { 
  fetchGmailEmails, 
  fetchOutlookEmails 
} from '@/services/email-integration-provider-service';
import { saveImportedEmails } from '@/services/email-message-service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useEmailIntegrations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState<boolean>(false);
  
  // Fetch email integrations
  const { 
    data: emailIntegrations = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['emailIntegrations'],
    queryFn: fetchEmailIntegrations,
    enabled: !!user
  });

  // Create email integration mutation
  const createMutation = useMutation({
    mutationFn: (integration: Omit<EmailIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => 
      createEmailIntegration(integration, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailIntegrations'] });
      toast.success('Email integration created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating email integration:', error);
      toast.error(`Failed to create email integration: ${error.message}`);
    }
  });

  // Delete email integration mutation
  const deleteMutation = useMutation({
    mutationFn: deleteEmailIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailIntegrations'] });
      toast.success('Email integration disconnected');
    },
    onError: (error: any) => {
      console.error('Error deleting email integration:', error);
      toast.error(`Failed to disconnect email integration: ${error.message}`);
    }
  });

  // Handle importing emails
  const importIntegrationEmails = async (integrationId: string, provider: string) => {
    setIsImporting(true);
    try {
      // Fetch emails based on provider type
      const emails = provider === 'gmail' 
        ? await fetchGmailEmails(integrationId)
        : await fetchOutlookEmails(integrationId);
      
      // Save emails to database
      await saveImportedEmails(emails, user?.id || '');
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['emailMessages'] });
      
      toast.success(`Successfully imported ${emails.length} emails`);
    } catch (error: any) {
      console.error('Error importing emails:', error);
      toast.error(`Failed to import emails: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    emailIntegrations,
    isLoading,
    isError,
    isImporting,
    createEmailIntegration: createMutation.mutate,
    deleteEmailIntegration: deleteMutation.mutate,
    importIntegrationEmails,
  };
};
