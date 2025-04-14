
import { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { Job, JobOfferRecord } from '@/types/job-parsing';
import { useJobSearchState } from './state/useJobSearchState';
import { useJobSearchApi } from './api/useJobSearchApi';
import { useFeatureAccess } from './access/useFeatureAccess';

export const useJobSearch = () => {
  const { user } = useAuth();
  const {
    isLoading, setIsLoading,
    jobs, setJobs,
    searchParams, setSearchParams,
    selectedJob, setSelectedJob,
    searchHistory, setSearchHistory,
    isSearchHistoryOpen, setIsSearchHistoryOpen,
    aiSuggestion, setAiSuggestion,
    isAiModalOpen, setIsAiModalOpen,
    isGeneratingAiSuggestion, setIsGeneratingAiSuggestion,
    handleParamChange
  } = useJobSearchState();

  const { hasAccess, isAccessLoading, userCompanyId } = useFeatureAccess(user?.id);
  
  const { 
    searchJobs, 
    generateAiContactSuggestion, 
    loadSearchHistory 
  } = useJobSearchApi(userCompanyId, user?.id);

  // Load search history when user, access or company ID changes
  useEffect(() => {
    const fetchSearchHistory = async () => {
      if (!user || !hasAccess || !userCompanyId) return;
      
      const history = await loadSearchHistory(user.id);
      setSearchHistory(history);
    };
    
    if (hasAccess && userCompanyId) {
      fetchSearchHistory();
    }
  }, [user, hasAccess, userCompanyId]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchJobs(searchParams);
      setJobs(results);
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
      const suggestion = await generateAiContactSuggestion(jobs, searchParams.query);
      setAiSuggestion(suggestion);
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
