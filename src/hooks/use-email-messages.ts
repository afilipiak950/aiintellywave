
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { 
  fetchEmailMessages, 
  createEmailMessage,
  fetchEmailAnalysis,
  createEmailAnalysis,
  saveImportedEmails
} from '@/services/email-message-service';
import { 
  fetchGmailEmails, 
  fetchOutlookEmails
} from '@/services/email-integration-provider-service';
import { EmailMessage, EmailAnalysis, EmailIntegration } from '@/types/persona';
import { supabase } from '@/integrations/supabase/client';

export const useEmailMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const emailMessagesQuery = useQuery({
    queryKey: ['emailMessages'],
    queryFn: fetchEmailMessages,
    enabled: !!user,
  });

  // Mutations
  const createEmailMessageMutation = useMutation({
    mutationFn: async (message: Omit<EmailMessage, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return await createEmailMessage(message, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailMessages'] });
      toast({
        title: 'Success',
        description: 'Email message added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add email message: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const analyzeEmailMutation = useMutation({
    mutationFn: async ({ emailId, emailContent }: { 
      emailId: string;
      emailContent: string;
    }) => {
      // Call the analyze-email function
      const { data, error } = await supabase.functions.invoke('analyze-email', {
        body: { emailContent },
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }
      
      // Create the analysis record in database
      const analysisData: Omit<EmailAnalysis, 'id' | 'created_at' | 'updated_at'> = {
        email_id: emailId,
        tone_analysis: data.analysis.tone,
        style_metrics: {
          style: data.analysis.style,
          language: data.analysis.language,
          metrics: data.analysis.metrics
        },
        summary: data.analysis.summary,
        persona_match: {} // Will be populated in future version
      };
      
      return await createEmailAnalysis(analysisData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailAnalysis'] });
      toast({
        title: 'Success',
        description: 'Email analysis completed',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Email analysis failed: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const importIntegrationEmailsMutation = useMutation({
    mutationFn: async ({ 
      integration, 
      count = 100 
    }: { 
      integration: EmailIntegration;
      count?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Fetch emails based on provider
      let emails: EmailMessage[] = [];
      
      if (integration.provider === 'gmail') {
        emails = await fetchGmailEmails(integration.id, count);
      } else if (integration.provider === 'outlook') {
        emails = await fetchOutlookEmails(integration.id, count);
      } else {
        throw new Error(`Unsupported provider: ${integration.provider}`);
      }
      
      // Save emails to database
      return await saveImportedEmails(emails, user.id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emailMessages'] });
      toast({
        title: 'Success',
        description: `Imported ${data.length} emails successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to import emails: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const batchAnalyzeEmailsMutation = useMutation({
    mutationFn: async ({ emailIds }: { emailIds: string[] }) => {
      // Fetch all selected emails first
      const { data: emails, error: fetchError } = await supabase
        .from('email_messages')
        .select('*')
        .in('id', emailIds);
        
      if (fetchError) throw fetchError;
      
      // Analyze each email
      const analysisPromises = emails.map(email => 
        analyzeEmailMutation.mutateAsync({
          emailId: email.id,
          emailContent: email.body,
        })
      );
      
      return await Promise.all(analysisPromises);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emailAnalysis'] });
      toast({
        title: 'Batch Analysis Complete',
        description: `Successfully analyzed ${data.length} emails`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Batch analysis failed: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const getEmailAnalysis = async (emailId: string) => {
    return await fetchEmailAnalysis(emailId);
  };

  return {
    emailMessages: emailMessagesQuery.data || [],
    isLoadingMessages: emailMessagesQuery.isLoading,
    isErrorMessages: emailMessagesQuery.isError,
    createEmailMessage: createEmailMessageMutation.mutateAsync,
    analyzeEmail: analyzeEmailMutation.mutateAsync,
    isAnalyzing: analyzeEmailMutation.isPending,
    importIntegrationEmails: importIntegrationEmailsMutation.mutateAsync,
    isImporting: importIntegrationEmailsMutation.isPending,
    batchAnalyzeEmails: batchAnalyzeEmailsMutation.mutateAsync,
    isBatchAnalyzing: batchAnalyzeEmailsMutation.isPending,
    getEmailAnalysis,
  };
};
