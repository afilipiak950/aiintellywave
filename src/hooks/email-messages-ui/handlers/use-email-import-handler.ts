
import { toast } from '@/hooks/use-toast';
import { usePersonas } from '@/hooks/use-personas';
import { EmailImportFormValues } from '@/components/personas/EmailImportForm';
import { usePersonaHandlers } from './use-persona-handlers';
import { useAnalysisAggregator } from './use-analysis-aggregator';

export function useEmailImportHandler(setters: {
  setIsImportDialogOpen: (isOpen: boolean) => void;
  setAggregatedAnalysis: (analysis: any) => void;
  setSuggestedPersona: (persona: any) => void;
  setIsPersonaSheetOpen: (isOpen: boolean) => void;
}) {
  const { 
    createEmailMessage, 
    analyzeEmail,
    personas,
  } = usePersonas();
  
  const { createPersonaAutomatically, updateExistingPersona } = usePersonaHandlers();
  const { aggregateAllAnalyses } = useAnalysisAggregator(setters);

  const handleEmailImport = async (values: EmailImportFormValues) => {
    try {
      const emailPromises = values.emailBodies.map(async ({ body }) => {
        const messageData = { body };
        return await createEmailMessage(messageData);
      });

      const createdEmails = await Promise.all(emailPromises);
      
      setters.setIsImportDialogOpen(false);
      
      // Automatically analyze all emails
      const analysisPromises = createdEmails.map(email => 
        analyzeEmail({
          emailId: email.id,
          emailContent: email.body,
        })
      );
      
      await Promise.all(analysisPromises);
      toast({
        title: "Emails Analyzed",
        description: `Successfully analyzed ${createdEmails.length} emails`,
      });
      
      // Aggregate analyses and create persona
      const result = await aggregateAllAnalyses();
      
      if (result) {
        const { suggestedPersona } = result;
        
        // Check if a persona already exists
        if (personas.length > 0) {
          // Update the first existing persona
          try {
            await updateExistingPersona(suggestedPersona);
          } catch (error) {
            // Show the persona creation sheet for manual editing if update fails
            setters.setIsPersonaSheetOpen(true);
          }
        } else {
          // Create a new persona automatically
          try {
            await createPersonaAutomatically(suggestedPersona);
          } catch (error) {
            // Show the persona creation sheet for manual creation if creation fails
            setters.setIsPersonaSheetOpen(true);
          }
        }
      }
    } catch (error) {
      console.error('Error importing emails:', error);
      toast({
        title: "Import Error",
        description: "Failed to import and analyze emails. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    handleEmailImport
  };
}
