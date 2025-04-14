
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Job, JobOfferRecord } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';

export const useJobSearchApi = (userCompanyId: string | null, userId: string | null) => {
  const searchJobs = async (searchParams: SearchParams): Promise<Job[]> => {
    if (!searchParams.query) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return [];
    }
    
    if (!userCompanyId) {
      toast({
        title: "Error",
        description: "Unable to determine your company. Please contact support.",
        variant: "destructive",
      });
      return [];
    }
    
    try {
      // Mock API call - would be replaced with actual implementation
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) throw new Error('Failed to search jobs');
      
      const result = await response.json();
      const jobs = result.jobs || [];
      
      // Save search to history
      if (userId) {
        await saveSearchToHistory(userId, userCompanyId, searchParams, jobs);
      }
      
      return jobs;
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to search jobs. Please try again.",
        variant: "destructive",
      });
      
      // For demo, return mock data
      const mockJobs = [
        {
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'Berlin, Germany',
          description: 'We are seeking a talented Software Engineer to join our team...',
          url: 'https://example.com/job1'
        },
        {
          title: 'Product Manager',
          company: 'Innovation Inc',
          location: 'Munich, Germany',
          description: 'Lead product development in our fast-growing company...',
          url: 'https://example.com/job2'
        }
      ];
      
      // Save mock search to history
      if (userId && userCompanyId) {
        await saveSearchToHistory(userId, userCompanyId, searchParams, mockJobs);
      }
      
      return mockJobs;
    }
  };

  const saveSearchToHistory = async (
    userId: string, 
    companyId: string, 
    searchParams: SearchParams, 
    searchResults: Job[]
  ) => {
    const { error } = await supabase
      .from('job_search_history')
      .insert({
        user_id: userId,
        company_id: companyId,
        search_query: searchParams.query,
        search_location: searchParams.location,
        search_experience: searchParams.experience,
        search_industry: searchParams.industry,
        search_results: searchResults,
      });
      
    if (error) {
      console.error('Error saving search history:', error);
    }
  };

  const generateAiContactSuggestion = async (jobs: Job[], query: string): Promise<any> => {
    if (jobs.length === 0) return null;
    
    try {
      // Mock API call
      const response = await fetch('/api/ai/suggest-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs, query }),
      });
      
      if (!response.ok) throw new Error('Failed to generate AI suggestion');
      
      const result = await response.json();
      
      // Update the latest search with the AI suggestion
      if (userId && userCompanyId && result) {
        const { data: latestSearches } = await supabase
          .from('job_search_history')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (latestSearches && latestSearches.length > 0) {
          const latestSearchId = latestSearches[0].id;
          const { error } = await supabase
            .from('job_search_history')
            .update({ ai_contact_suggestion: result })
            .eq('id', latestSearchId);
            
          if (error) {
            console.error('Error updating AI suggestion:', error);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error generating AI contact suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI contact suggestion.",
        variant: "destructive",
      });
      
      // For demo, return mock data
      const mockSuggestion = {
        contactStrategy: "Based on the job listings, I recommend focusing on these key points in your outreach...",
        keyPoints: [
          "Highlight your experience with software development in your initial contact",
          "Mention specific projects relevant to the company's industry",
          "Ask about their current development roadmap to show interest",
        ],
        suggestedEmail: "Subject: Connecting about the Software Engineer position\n\nDear Hiring Manager,\n\nI noticed your listing for a Software Engineer at Tech Corp and was immediately interested...",
      };
      
      return mockSuggestion;
    }
  };

  const loadSearchHistory = async (userId: string | null): Promise<JobOfferRecord[]> => {
    if (!userId || !userCompanyId) return [];
    
    try {
      const { data, error } = await supabase
        .from('job_search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching search history:', error);
        return [];
      }
      
      // Convert the data to the expected JobOfferRecord format
      const formattedData = (data || []).map((item): JobOfferRecord => {
        // Safely parse search_results to ensure we have Job[] type
        let searchResults: Job[] = [];
        
        try {
          // If search_results is already an array, use it, otherwise try to parse it
          if (Array.isArray(item.search_results)) {
            // Validate that each item in the array has the Job structure
            searchResults = item.search_results.map((job: any): Job => ({
              title: job.title || '',
              company: job.company || '',
              location: job.location || '',
              description: job.description || '',
              url: job.url || '',
              datePosted: job.datePosted || undefined
            }));
          } else if (typeof item.search_results === 'string') {
            // If it's a JSON string, parse it
            const parsed = JSON.parse(item.search_results);
            if (Array.isArray(parsed)) {
              searchResults = parsed.map((job: any): Job => ({
                title: job.title || '',
                company: job.company || '',
                location: job.location || '',
                description: job.description || '',
                url: job.url || '',
                datePosted: job.datePosted || undefined
              }));
            }
          }
        } catch (err) {
          console.error('Error parsing search results:', err);
        }
        
        return {
          id: item.id,
          company_id: item.company_id,
          user_id: item.user_id,
          search_query: item.search_query,
          search_location: item.search_location || '',
          search_experience: item.search_experience || '',
          search_industry: item.search_industry || '',
          search_results: searchResults,
          ai_contact_suggestion: item.ai_contact_suggestion,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      });
      
      return formattedData;
    } catch (err) {
      console.error('Failed to load search history:', err);
      return [];
    }
  };

  const getUserCompanyId = async (userId: string | null): Promise<string | null> => {
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
    } catch (error) {
      console.error('Error in getUserCompanyId:', error);
      return null;
    }
  };

  return {
    searchJobs,
    generateAiContactSuggestion,
    loadSearchHistory,
    getUserCompanyId
  };
};
