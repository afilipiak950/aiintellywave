
import { supabase } from '@/integrations/supabase/client';
import { Job, JobOfferRecord } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';

export const useJobSearchApi = (companyId: string | null, userId: string | null) => {
  // Function to get the user's company ID (if not provided)
  const getUserCompanyId = async (userId: string): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching company ID:', error);
        return null;
      }
      
      return data?.company_id || null;
    } catch (err) {
      console.error('Exception fetching company ID:', err);
      return null;
    }
  };

  // Function to search for jobs based on search parameters
  const searchJobs = async (searchParams: SearchParams): Promise<Job[]> => {
    try {
      if (!userId || !companyId) {
        console.error('Missing user ID or company ID for job search');
        throw new Error('Missing user ID or company ID');
      }
      
      console.log('Searching jobs with params:', searchParams);
      
      // Call the Google Jobs scraper Edge Function
      const { data, error } = await supabase.functions.invoke('google-jobs-scraper', {
        body: {
          searchParams,
          userId,
          companyId
        }
      });
      
      if (error) {
        console.error('Error calling Google Jobs scraper:', error);
        throw new Error(error.message || 'Failed to search jobs');
      }
      
      if (!data || !data.success) {
        console.error('API returned error:', data?.error || 'Unknown error');
        throw new Error(data?.error || 'Failed to search jobs');
      }
      
      console.log('Job search results:', data.data.results);
      return data.data.results;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  };

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

  // Function to load search history
  const loadSearchHistory = async (userId: string): Promise<any[]> => {
    try {
      if (!companyId) {
        console.log('No company ID available for loading search history');
        return [];
      }
      
      console.log('Loading job search history for user:', userId);
      
      const { data, error } = await supabase
        .from('job_search_history')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error loading search history:', error);
        return [];
      }
      
      // Convert search_results from JSON to Job objects
      return data.map(record => ({
        ...record,
        search_results: record.search_results || [],
        ai_contact_suggestion: record.ai_contact_suggestion || null
      }));
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
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
    getUserCompanyId,
    searchJobs,
    generateAiContactSuggestion,
    loadSearchHistory
  };
};
