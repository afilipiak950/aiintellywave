
import { EmailMessage } from '@/types/persona';
import { PersonaCreationFormValues } from '@/components/personas/schemas/persona-form-schema';
import { EmailImportFormValues } from '@/components/personas/EmailImportForm';
import { useEmailImportHandler } from './handlers/use-email-import-handler';
import { useEmailViewHandlers } from './handlers/use-email-view-handlers';
import { useBatchAnalysisHandler } from './handlers/use-batch-analysis-handler';

export function useEmailAnalysisHandlers(setters: {
  setSelectedEmail: (email: EmailMessage | null) => void;
  setAnalysisData: (analysis: any) => void;
  setIsAnalysisDialogOpen: (isOpen: boolean) => void;
  setAggregatedAnalysis: (analysis: any) => void;
  setSuggestedPersona: (persona: any) => void;
  setIsPersonaSheetOpen: (isOpen: boolean) => void;
  setIsImportDialogOpen: (isOpen: boolean) => void;
  setSelectedEmails: (emails: string[]) => void;
  setIsBatchAnalyzing: (isAnalyzing: boolean) => void;
}) {
  // Import handler
  const { handleEmailImport } = useEmailImportHandler({
    setIsImportDialogOpen: setters.setIsImportDialogOpen,
    setAggregatedAnalysis: setters.setAggregatedAnalysis,
    setSuggestedPersona: setters.setSuggestedPersona,
    setIsPersonaSheetOpen: setters.setIsPersonaSheetOpen
  });
  
  // Email view handlers
  const { handleViewAnalysis, handleAnalyzeNow } = useEmailViewHandlers({
    setSelectedEmail: setters.setSelectedEmail,
    setAnalysisData: setters.setAnalysisData,
    setIsAnalysisDialogOpen: setters.setIsAnalysisDialogOpen
  });
  
  // Batch analysis handlers
  const { 
    handleAnalyzeSelected, 
    updatePersonaFromAllAnalyses,
    handleCreatePersonaFromSelected 
  } = useBatchAnalysisHandler({
    setSelectedEmails: setters.setSelectedEmails,
    setIsBatchAnalyzing: setters.setIsBatchAnalyzing,
    setAggregatedAnalysis: setters.setAggregatedAnalysis,
    setSuggestedPersona: setters.setSuggestedPersona,
    setIsPersonaSheetOpen: setters.setIsPersonaSheetOpen
  });
  
  const onEmailImportSubmit = async (values: EmailImportFormValues) => {
    await handleEmailImport(values);
  };
  
  const onPersonaSubmit = async (values: PersonaCreationFormValues) => {
    // Re-using logic from PersonaHandlers but through the EmailImportHandler
    try {
      await handleEmailImport({ emailBodies: [] }); // Just to trigger the persona creation logic
      
      setters.setIsPersonaSheetOpen(false);
      setters.setSuggestedPersona(null);
      
      return true;
    } catch (error) {
      console.error('Error submitting persona:', error);
      return false;
    }
  };

  return {
    onEmailImportSubmit,
    onPersonaSubmit,
    handleViewAnalysis,
    handleAnalyzeNow: async () => {
      const selectedEmail = setters.setSelectedEmail as unknown as () => EmailMessage | null;
      const emailData = selectedEmail();
      await handleAnalyzeNow(emailData);
      await updatePersonaFromAllAnalyses();
    },
    handleAnalyzeSelected,
    handleCreatePersonaFromSelected,
    updatePersonaFromAllAnalyses,
  };
}
