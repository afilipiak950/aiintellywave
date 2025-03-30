
import { usePersonas } from '@/hooks/use-personas';
import { useDialogsState } from './email-messages-ui/use-dialogs-state';
import { useEmailSelection } from './email-messages-ui/use-email-selection';
import { useEmailAnalysisHandlers } from './email-messages-ui/use-email-analysis-handlers';

export function useEmailMessagesUI() {
  const { 
    emailMessages, 
    personas,
    isAnalyzing 
  } = usePersonas();

  // Use specialized hooks
  const dialogsState = useDialogsState();
  const emailSelection = useEmailSelection();
  
  // Create handlers with access to state setters
  const handlers = useEmailAnalysisHandlers({
    setSelectedEmail: dialogsState.setSelectedEmail,
    setAnalysisData: dialogsState.setAnalysisData,
    setIsAnalysisDialogOpen: dialogsState.setIsAnalysisDialogOpen,
    setAggregatedAnalysis: dialogsState.setAggregatedAnalysis,
    setSuggestedPersona: dialogsState.setSuggestedPersona,
    setIsPersonaSheetOpen: dialogsState.setIsPersonaSheetOpen,
    setIsImportDialogOpen: dialogsState.setIsImportDialogOpen,
    setSelectedEmails: emailSelection.setSelectedEmails,
    setIsBatchAnalyzing: emailSelection.setIsBatchAnalyzing,
  });

  // Wrap the handlers that need access to selected emails
  const wrappedHandlers = {
    ...handlers,
    handleAnalyzeSelected: (emails = emailSelection.selectedEmails): Promise<void> => 
      handlers.handleAnalyzeSelected(emails),
    handleCreatePersonaFromSelected: (): Promise<void> => 
      handlers.handleCreatePersonaFromSelected(),
  };

  // Create a list of emails to display based on expanded state
  const displayedEmails = emailSelection.isEmailListExpanded 
    ? emailMessages 
    : emailMessages.slice(0, 5);

  return {
    // Dialog state
    ...dialogsState,
    
    // Email selection state
    ...emailSelection,
    
    // Wrapped handlers
    ...wrappedHandlers,
    
    // Data
    emailMessages,
    displayedEmails,
    isAnalyzing,
    personas,
    updatePersonaFromAllAnalyses: handlers.updatePersonaFromAllAnalyses,
  };
}
