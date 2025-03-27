
import { useMessageQueries } from './email-messages/use-message-queries';
import { useMessageMutations } from './email-messages/use-message-mutations';

export const useEmailMessages = () => {
  const {
    emailMessages,
    isLoadingMessages,
    isErrorMessages,
    getEmailAnalysis,
  } = useMessageQueries();

  const {
    createEmailMessage,
    analyzeEmail,
    isAnalyzing,
    importIntegrationEmails,
    isImporting,
    batchAnalyzeEmails,
    isBatchAnalyzing,
  } = useMessageMutations();

  return {
    // Message queries
    emailMessages,
    isLoadingMessages,
    isErrorMessages,
    getEmailAnalysis,
    
    // Message mutations
    createEmailMessage,
    analyzeEmail,
    isAnalyzing,
    importIntegrationEmails,
    isImporting,
    batchAnalyzeEmails,
    isBatchAnalyzing,
  };
};
