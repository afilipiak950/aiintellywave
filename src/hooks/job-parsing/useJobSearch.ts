
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isJobParsingEnabled } from '@/hooks/use-feature-access';
import { Job, JobOfferRecord } from '@/types/job-parsing';

interface SearchParams {
  query: string;
  location: string;
  experience?: string;
  industry?: string;
}

export const useJobSearch = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    location: '',
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchHistory, setSearchHistory] = useState<JobOfferRecord[]>([]);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingAiSuggestion, setIsGeneratingAiSuggestion] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isAccessLoading, setIsAccessLoading] = useState(true);

  // Check if user has access to this feature
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;
      
      setIsAccessLoading(true);
      try {
        const hasAccess = await isJobParsingEnabled(user.id);
        setHasAccess(hasAccess);
        
        if (!hasAccess) {
          console.log('User does not have access to job parsing feature');
        }
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setIsAccessLoading(false);
      }
    };
    
    checkAccess();
  }, [user]);

  // Load search history
  useEffect(() => {
    const loadSearchHistory = async () => {
      if (!user || !hasAccess) return;
      
      try {
        const { data, error } = await supabase
          .from('job_search_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching search history:', error);
          return;
        }
        
        setSearchHistory(data || []);
      } catch (err) {
        console.error('Failed to load search history:', err);
      }
    };
    
    if (hasAccess) {
      loadSearchHistory();
    }
  }, [user, hasAccess]);

  const handleParamChange = (param: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [param]: value }));
  };

  const handleSearch = async () => {
    if (!searchParams.query) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Mock API call - would be replaced with actual implementation
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) throw new Error('Failed to search jobs');
      
      const result = await response.json();
      setJobs(result.jobs || []);
      
      // Save search to history
      if (user) {
        const { error } = await supabase
          .from('job_search_history')
          .insert({
            user_id: user.id,
            company_id: user.app_metadata?.company_id,
            search_query: searchParams.query,
            search_location: searchParams.location,
            search_experience: searchParams.experience,
            search_industry: searchParams.industry,
            search_results: result.jobs || [],
          });
          
        if (error) {
          console.error('Error saving search history:', error);
        }
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to search jobs. Please try again.",
        variant: "destructive",
      });
      
      // For demo, set mock data
      setJobs([
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSearchResult = (record: JobOfferRecord) => {
    setJobs(record.search_results || []);
    setSearchParams({
      query: record.search_query,
      location: record.search_location || '',
      experience: record.search_experience || '',
      industry: record.search_industry || '',
    });
    setIsSearchHistoryOpen(false);
    
    if (record.ai_contact_suggestion) {
      setAiSuggestion(record.ai_contact_suggestion);
    }
  };

  const generateAiSuggestion = async () => {
    if (jobs.length === 0) return;
    
    setIsGeneratingAiSuggestion(true);
    try {
      // Mock API call
      const response = await fetch('/api/ai/suggest-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs, query: searchParams.query }),
      });
      
      if (!response.ok) throw new Error('Failed to generate AI suggestion');
      
      const result = await response.json();
      setAiSuggestion(result);
      setIsAiModalOpen(true);
      
      // Update the latest search with the AI suggestion
      if (user && searchHistory.length > 0) {
        const latestSearch = searchHistory[0];
        const { error } = await supabase
          .from('job_search_history')
          .update({ ai_contact_suggestion: result })
          .eq('id', latestSearch.id);
          
        if (error) {
          console.error('Error updating AI suggestion:', error);
        }
      }
    } catch (error) {
      console.error('Error generating AI contact suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI contact suggestion.",
        variant: "destructive",
      });
      
      // For demo, set mock data
      const mockSuggestion = {
        contactStrategy: "Based on the job listings, I recommend focusing on these key points in your outreach...",
        keyPoints: [
          "Highlight your experience with software development in your initial contact",
          "Mention specific projects relevant to the company's industry",
          "Ask about their current development roadmap to show interest",
        ],
        suggestedEmail: "Subject: Connecting about the Software Engineer position\n\nDear Hiring Manager,\n\nI noticed your listing for a Software Engineer at Tech Corp and was immediately interested...",
      };
      
      setAiSuggestion(mockSuggestion);
      setIsAiModalOpen(true);
    } finally {
      setIsGeneratingAiSuggestion(false);
    }
  };

  return {
    isLoading,
    hasAccess,
    isAccessLoading,
    searchParams,
    jobs,
    selectedJob,
    searchHistory,
    isSearchHistoryOpen,
    aiSuggestion,
    isAiModalOpen,
    isGeneratingAiSuggestion,
    handleParamChange,
    handleSearch,
    loadSearchResult,
    setSelectedJob,
    setIsSearchHistoryOpen,
    setIsAiModalOpen,
    generateAiSuggestion
  };
};
