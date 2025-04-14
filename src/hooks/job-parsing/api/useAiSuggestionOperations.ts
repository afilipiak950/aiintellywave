
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';

export const useAiSuggestionOperations = (companyId: string | null, userId: string | null) => {
  // Function to generate AI contact suggestion based on job results
  const generateAiContactSuggestion = async (jobs: Job[], query: string): Promise<any> => {
    try {
      if (!userId || !companyId || jobs.length === 0) {
        console.error('Missing data for AI suggestion');
        return null;
      }
      
      console.log('Generating AI contact suggestion for jobs:', jobs.length);
      
      // In a real app, this would call an AI API
      // For this demo, we'll use mock data
      const mockSuggestion = {
        subject: `Regarding ${query} opportunity`,
        greeting: "Dear Hiring Manager,",
        body: `I noticed your company is looking for candidates with expertise in ${query}. I believe my skills and experience make me a strong fit for this role.`,
        closing: "I look forward to discussing this opportunity further.\n\nBest regards,\n[Your Name]",
        tips: [
          "Mention specific achievements related to the job requirements",
          "Reference something specific about the company to show your interest",
          "Keep your email concise and professional"
        ]
      };
      
      // Update the latest search with the AI suggestion
      await updateLatestSearchWithAiSuggestion(mockSuggestion);
      
      return mockSuggestion;
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      return null;
    }
  };

  // Helper function to update the latest search with AI suggestion
  const updateLatestSearchWithAiSuggestion = async (suggestion: any): Promise<void> => {
    try {
      if (!userId || !companyId) return;
      
      // Get the latest search record
      const { data, error } = await supabase
        .from('job_search_history')
        .select('id')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1);
        
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
