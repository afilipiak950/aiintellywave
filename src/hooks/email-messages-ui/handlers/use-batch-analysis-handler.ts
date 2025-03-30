
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
      
      // Update persona from all analyses right after analysis is complete
      await updatePersonaFromAllAnalyses();
    } catch (error) {
      console.error('Error batch analyzing emails:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze selected emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setters.setIsBatchAnalyzing(false);
    }
  };

  const updatePersonaFromAllAnalyses = async () => {
    try {
      console.log("Starting updatePersonaFromAllAnalyses");
      
      const result = await aggregateAllAnalyses();
      
      if (result) {
        const { suggestedPersona } = result;
        
        // Check if a persona already exists to update
        console.log(`Current personas: ${personas.length}`);
        if (personas.length > 0) {
          await updateExistingPersona(suggestedPersona);
        } else {
          await createPersonaAutomatically(suggestedPersona);
        }
      }
    } catch (error) {
      console.error('Error updating persona from analyses:', error);
      toast({
        title: "Error",
        description: "Failed to update persona from analyses. Please try again.",
        variant: "destructive"
      });
      setters.setIsPersonaSheetOpen(true);
    }
  };

  const handleCreatePersonaFromSelected = async (selectedEmails: string[]) => {
    if (selectedEmails.length === 0) return;
    
    try {
      const result = await aggregateSelectedAnalyses(selectedEmails);
      
      if (result) {
        const { suggestedPersona } = result;
        
        // Check if we should update or create
        if (personas.length > 0) {
          await updateExistingPersona(suggestedPersona);
        } else {
          await createPersonaAutomatically(suggestedPersona);
        }
        
        setters.setSelectedEmails([]);
      } else {
        toast({
          title: "No Analysis Data",
          description: "Please analyze selected emails first before creating a persona",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating persona from selected emails:', error);
      toast({
        title: "Error",
        description: "Failed to create persona from selected emails. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    handleAnalyzeSelected,
    updatePersonaFromAllAnalyses,
    handleCreatePersonaFromSelected
  };
}
