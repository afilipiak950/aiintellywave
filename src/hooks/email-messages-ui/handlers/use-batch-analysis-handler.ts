
import { toast } from '@/hooks/use-toast';
import { usePersonas } from '@/hooks/use-personas';
import { supabase } from '@/integrations/supabase/client';
import { usePersonaHandlers } from './use-persona-handlers';
import { useAnalysisAggregator } from './use-analysis-aggregator';

export function useBatchAnalysisHandler(setters: {
  setSelectedEmails: (emails: string[]) => void;
  setIsBatchAnalyzing: (isAnalyzing: boolean) => void;
  setAggregatedAnalysis: (analysis: any) => void;
  setSuggestedPersona: (persona: any) => void;
  setIsPersonaSheetOpen: (isOpen: boolean) => void;
}) {
  const { analyzeEmail, personas } = usePersonas();
  const { createPersonaAutomatically, updateExistingPersona } = usePersonaHandlers();
  const { aggregateAllAnalyses, aggregateSelectedAnalyses } = useAnalysisAggregator(setters);

  const handleAnalyzeSelected = async (selectedEmails: string[]) => {
    if (selectedEmails.length === 0) return;
    
    try {
      setters.setIsBatchAnalyzing(true);
      
      console.log(`Starting analysis of ${selectedEmails.length} selected emails`);
      for (const emailId of selectedEmails) {
        const { data } = await supabase
          .from('email_messages')
          .select('*')
          .eq('id', emailId)
          .single();
          
        if (data) {
          await analyzeEmail({
            emailId: data.id,
            emailContent: data.body,
          });
        }
      }
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${selectedEmails.length} emails`,
      });
      
      setters.setSelectedEmails([]);
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error('Error batch analyzing emails:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze selected emails. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setters.setIsBatchAnalyzing(false);
    }
  };

  const updatePersonaFromAllAnalyses = async (): Promise<boolean> => {
    try {
      console.log("Starting updatePersonaFromAllAnalyses");
      
      const result = await aggregateAllAnalyses();
      
      if (result) {
        const { suggestedPersona } = result;
        
        console.log(`Current personas: ${personas.length}`);
        try {
          // Check if a persona already exists to update
          if (personas.length > 0) {
            console.log("Updating existing persona with new analysis data");
            await updateExistingPersona(suggestedPersona);
            
            toast({
              title: "Persona Updated",
              description: "Your persona has been updated based on all analyzed emails",
            });
          } else {
            console.log("Creating new persona from all analyses");
            await createPersonaAutomatically(suggestedPersona);
            
            toast({
              title: "Persona Created",
              description: "New persona has been created based on all analyzed emails",
            });
          }
          return true;
        } catch (error) {
          console.error('Error creating/updating persona automatically:', error);
          // Show persona creation UI for manual input if automatic creation fails
          setters.setSuggestedPersona(suggestedPersona);
          setters.setIsPersonaSheetOpen(true);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating persona from analyses:', error);
      toast({
        title: "Error",
        description: "Failed to update persona from analyses. Please try manually.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleCreatePersonaFromSelected = async (selectedEmails: string[]): Promise<boolean> => {
    if (selectedEmails.length === 0) return false;
    
    try {
      console.log(`Creating persona from ${selectedEmails.length} selected emails`);
      
      // First analyze all selected emails
      const analysisSuccess = await handleAnalyzeSelected(selectedEmails);
      if (!analysisSuccess) return false;
      
      const result = await aggregateSelectedAnalyses(selectedEmails);
      
      if (result) {
        const { suggestedPersona } = result;
        
        try {
          // Check if we should update or create
          if (personas.length > 0) {
            console.log("Updating existing persona from selected emails");
            await updateExistingPersona(suggestedPersona);
            
            toast({
              title: "Persona Updated",
              description: "Your persona has been updated based on selected emails",
            });
          } else {
            console.log("Creating new persona from selected emails");
            await createPersonaAutomatically(suggestedPersona);
            
            toast({
              title: "Persona Created",
              description: "New persona has been created based on selected emails",
            });
          }
          
          setters.setSelectedEmails([]);
          return true;
        } catch (error) {
          console.error('Error creating/updating persona:', error);
          // Show persona creation UI for manual input if automatic creation fails
          setters.setSuggestedPersona(suggestedPersona);
          setters.setIsPersonaSheetOpen(true);
          return false;
        }
      } else {
        toast({
          title: "No Analysis Data",
          description: "Please analyze selected emails first before creating a persona",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating persona from selected emails:', error);
      toast({
        title: "Error",
        description: "Failed to create persona from selected emails. Please try manually.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handleAnalyzeSelected,
    updatePersonaFromAllAnalyses,
    handleCreatePersonaFromSelected
  };
}
