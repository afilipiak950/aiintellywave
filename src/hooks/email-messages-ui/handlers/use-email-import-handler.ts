
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

  const handleEmailImport = async (values: EmailImportFormValues): Promise<boolean> => {
    try {
      // Only process if there are email bodies to import
      if (values.emailBodies.length === 0) return false;

      const emailPromises = values.emailBodies.map(async ({ body }) => {
        const messageData = { body };
        return await createEmailMessage(messageData);
      });

      const createdEmails = await Promise.all(emailPromises);
      
      setters.setIsImportDialogOpen(false);
      
      console.log(`Starting analysis of ${createdEmails.length} emails`);
      
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
      console.log("Aggregating analyses to create persona automatically");
      const result = await aggregateAllAnalyses();
      
      if (result) {
        const { suggestedPersona } = result;
        console.log("Generated persona suggestion:", suggestedPersona);
        
        try {
          // Check if a persona already exists
          if (personas.length > 0) {
            console.log("Updating existing persona:", personas[0].id);
            // Update the first existing persona
            await updateExistingPersona(suggestedPersona);
            
            toast({
              title: "Persona Updated",
              description: "Your persona has been automatically updated based on email analysis",
            });
          } else {
            console.log("Creating new persona automatically");
            // Create a new persona automatically
            await createPersonaAutomatically(suggestedPersona);
            
            toast({
              title: "Persona Created",
              description: "New persona has been automatically created based on email analysis",
            });
          }
          
          // Return true to indicate success including persona creation
          return true;
        } catch (error) {
          console.error('Error creating/updating persona:', error);
          // Show the persona creation sheet for manual editing if automatic creation fails
          setters.setSuggestedPersona(suggestedPersona);
          setters.setIsPersonaSheetOpen(true);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing emails:', error);
      toast({
        title: "Import Error",
        description: "Failed to import and analyze emails. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handleEmailImport
  };
}
