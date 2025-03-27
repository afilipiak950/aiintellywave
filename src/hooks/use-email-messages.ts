
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { 
  fetchEmailMessages, 
  createEmailMessage,
  fetchEmailAnalysis,
  createEmailAnalysis
} from '@/services/email-message-service';
import { EmailMessage, EmailAnalysis } from '@/types/persona';
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
    mutationFn: async ({ emailId, emailContent, emailSubject }: { 
      emailId: string;
      emailContent: string;
      emailSubject?: string;
    }) => {
      // Call the analyze-email function
      const { data, error } = await supabase.functions.invoke('analyze-email', {
        body: { emailContent, emailSubject },
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

  const getEmailAnalysis = async (emailId: string) => {
    return await fetchEmailAnalysis(emailId);
  };

  return {
    emailMessages: emailMessagesQuery.data || [],
    isLoadingMessages: emailMessagesQuery.isLoading,
    isErrorMessages: emailMessagesQuery.isError,
    createEmailMessage: createEmailMessageMutation.mutateAsync, // Changed from mutate to mutateAsync
    analyzeEmail: analyzeEmailMutation.mutateAsync, // Changed from mutate to mutateAsync
    isAnalyzing: analyzeEmailMutation.isPending,
    getEmailAnalysis,
  };
};
