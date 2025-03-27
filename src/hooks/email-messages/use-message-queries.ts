
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { fetchEmailMessages, fetchEmailAnalysis } from '@/services/email-message-service';

export function useMessageQueries() {
  const { user } = useAuth();

  // Queries
  const emailMessagesQuery = useQuery({
    queryKey: ['emailMessages'],
    queryFn: fetchEmailMessages,
    enabled: !!user,
  });

  const getEmailAnalysis = async (emailId: string) => {
    return await fetchEmailAnalysis(emailId);
  };

  return {
    emailMessages: emailMessagesQuery.data || [],
    isLoadingMessages: emailMessagesQuery.isLoading,
    isErrorMessages: emailMessagesQuery.isError,
    getEmailAnalysis,
  };
}
