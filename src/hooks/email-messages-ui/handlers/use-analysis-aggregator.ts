
import { aggregateAnalysisResults, generateSuggestedPersona } from '@/utils/email-analysis-utils';
import { usePersonas } from '@/hooks/use-personas';
import { toast } from '@/hooks/use-toast';

export function useAnalysisAggregator(setters: {
  setAggregatedAnalysis: (analysis: any) => void;
  setSuggestedPersona: (persona: any) => void;
}) {
  const { 
    emailMessages,
    getEmailAnalysis 
  } = usePersonas();

  const aggregateAllAnalyses = async () => {
    try {
      console.log("Starting aggregateAllAnalyses");
      // Fetch all available analyses
      const analysesPromises = emailMessages.map(email => getEmailAnalysis(email.id));
      const analyses = await Promise.all(analysesPromises);
      
      const validAnalyses = analyses.filter(Boolean) as any[];
      console.log(`Found ${validAnalyses.length} valid analyses`);
      
      if (validAnalyses.length > 0) {
        const aggregated = aggregateAnalysisResults(validAnalyses);
        console.log("Aggregated analysis:", aggregated);
        setters.setAggregatedAnalysis(aggregated);
        
        const suggestedPersonaData = generateSuggestedPersona(aggregated);
        console.log("Generated suggested persona data:", suggestedPersonaData);
        setters.setSuggestedPersona(suggestedPersonaData);
        
        return {
          aggregatedAnalysis: aggregated,
          suggestedPersona: suggestedPersonaData
        };
      } else {
        console.log("No valid analyses found");
        return null;
      }
    } catch (error) {
      console.error('Error aggregating analyses:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to aggregate email analyses. Please try again.",
        variant: "destructive"
      });
      
      return null;
    }
  };

  const aggregateSelectedAnalyses = async (selectedEmailIds: string[]) => {
    try {
      if (selectedEmailIds.length === 0) return null;
      
      // Get analyses for the selected emails
      const analysesPromises = selectedEmailIds.map(emailId => getEmailAnalysis(emailId));
      const analyses = await Promise.all(analysesPromises);
      
      const validAnalyses = analyses.filter(Boolean) as any[];
      
      if (validAnalyses.length > 0) {
        const aggregated = aggregateAnalysisResults(validAnalyses);
        setters.setAggregatedAnalysis(aggregated);
        
        const suggestedPersonaData = generateSuggestedPersona(aggregated);
        setters.setSuggestedPersona(suggestedPersonaData);
        
        return {
          aggregatedAnalysis: aggregated,
          suggestedPersona: suggestedPersonaData
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error aggregating selected analyses:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to aggregate selected email analyses. Please try again.",
        variant: "destructive"
      });
      
      return null;
    }
  };
  
  return {
    aggregateAllAnalyses,
    aggregateSelectedAnalyses
  };
}
