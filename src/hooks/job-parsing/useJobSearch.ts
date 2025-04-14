
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
    handleParamChange,
    hasAccess, setHasAccess,
    isAccessLoading, setIsAccessLoading,
    userCompanyId, setUserCompanyId,
    error, setError
  } = useJobSearchState();

  // Use the Feature Access hook
  const accessData = useFeatureAccess(user?.id);
  
  // Set the feature access data
  useEffect(() => {
    if (accessData) {
      setHasAccess(accessData.hasAccess);
      setIsAccessLoading(accessData.isAccessLoading);
      setUserCompanyId(accessData.userCompanyId);
    }
  }, [accessData, setHasAccess, setIsAccessLoading, setUserCompanyId]);
  
  const { 
    searchJobs, 
    generateAiContactSuggestion, 
    loadSearchHistory 
  } = useJobSearchApi(userCompanyId, user?.id);

  // Load search history when user, access or company ID changes
  useEffect(() => {
    const fetchSearchHistory = async () => {
      if (!user || !hasAccess || !userCompanyId) return;
      
      try {
        const history = await loadSearchHistory(user.id);
        setSearchHistory(history);
      } catch (error) {
        console.error('Error fetching search history:', error);
      }
    };
    
    if (hasAccess && userCompanyId) {
      fetchSearchHistory();
    }
  }, [user, hasAccess, userCompanyId, loadSearchHistory, setSearchHistory]);

  const handleSearch = async () => {
    // Reset previous error state
    setError(null);
    
    // Validate search query
    if (!searchParams.query.trim()) {
      toast({
        title: "Suchbegriff erforderlich",
        description: "Bitte geben Sie einen Suchbegriff ein.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting job search with params:', searchParams);
      const results = await searchJobs(searchParams);
      console.log('Search results:', results);
      setJobs(results);
      
      if (results.length === 0) {
        toast({
          title: "Keine Ergebnisse gefunden",
          description: "Versuchen Sie es mit anderen Suchbegriffen.",
        });
      } else {
        toast({
          title: "Suchergebnisse geladen",
          description: `${results.length} Jobangebote gefunden.`,
        });
      }
    } catch (error: any) {
      console.error('Error searching jobs:', error);
      setError(error.message || "Ein unbekannter Fehler ist aufgetreten");
      toast({
        title: "Fehler bei der Suche",
        description: error.message || "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
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
    if (jobs.length === 0) {
      toast({
        title: "Keine Jobangebote",
        description: "Bitte führen Sie zuerst eine Suche durch.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingAiSuggestion(true);
    try {
      const suggestion = await generateAiContactSuggestion(jobs, searchParams.query);
      setAiSuggestion(suggestion);
      setIsAiModalOpen(true);
    } catch (error: any) {
      console.error('Error generating AI suggestion:', error);
      toast({
        title: "Fehler bei der KI-Analyse",
        description: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
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
    error,
    handleParamChange,
    handleSearch,
    loadSearchResult,
    setSelectedJob,
    setIsSearchHistoryOpen,
    setIsAiModalOpen,
    generateAiSuggestion
  };
};
