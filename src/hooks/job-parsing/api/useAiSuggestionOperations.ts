
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';

export const useAiSuggestionOperations = (companyId: string | null, userId: string | null) => {
  // Function to generate AI contact suggestion based on job results
  const generateAiContactSuggestion = async (jobs: Job[], query: string): Promise<any> => {
    try {
      if (jobs.length === 0) {
        console.error('No jobs provided for contact suggestion');
        throw new Error('Es wurden keine Jobs für den Kontaktvorschlag bereitgestellt');
      }
      
      console.log('Generating AI contact suggestion for jobs:', jobs.length);
      
      // Call the generate-contact-suggestion edge function
      const { data, error } = await supabase.functions.invoke('generate-contact-suggestion', {
        body: {
          searchId: 'temporary-search', // This will be replaced with a real ID if saved
          jobs: jobs,
          query: query,
          userId: userId, // Pass user ID for logging purposes
          companyId: companyId // Pass company ID for logging purposes
        }
      });
      
      if (error) {
        console.error('Error calling generate-contact-suggestion function:', error);
        throw new Error(error.message || 'Fehler beim Generieren des Kontaktvorschlags');
      }
      
      if (!data || !data.success || !data.suggestion) {
        console.error('Invalid response from contact suggestion function:', data);
        throw new Error('Ungültige Antwort vom Server erhalten');
      }
      
      console.log('Contact suggestion generated successfully:', data.suggestion);
      
      // Update the latest search with the AI suggestion if user is authenticated
      if (userId) {
        await updateLatestSearchWithAiSuggestion(data.suggestion);
      }
      
      return data.suggestion;
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten',
        variant: "destructive"
      });
      throw error;
    }
  };

  // Helper function to update the latest search with AI suggestion
  const updateLatestSearchWithAiSuggestion = async (suggestion: any): Promise<void> => {
    try {
      if (!userId) return;
      
      // Query for latest search - don't require company_id
      const query = supabase
        .from('job_search_history')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Add company_id filter only if it's available  
      if (companyId) {
        query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;
        
      if (error || !data || data.length === 0) {
        console.error('Error fetching latest search:', error);
        return;
      }
      
      // Update with AI suggestion
      await supabase
        .from('job_search_history')
        .update({
          ai_contact_suggestion: suggestion,
          updated_at: new Date().toISOString()
        })
        .eq('id', data[0].id);
    } catch (error) {
      console.error('Error updating search with AI suggestion:', error);
    }
  };

  return {
    generateAiContactSuggestion
  };
};
