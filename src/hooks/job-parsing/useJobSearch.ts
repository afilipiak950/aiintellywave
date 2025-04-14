import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { Job, JobOfferRecord } from '@/types/job-parsing';
import { useJobSearchState } from './state/useJobSearchState';
import { useJobSearchApi } from './api/useJobSearchApi';
import { useFeatureAccess } from './access/useFeatureAccess';

export const useJobSearch = () => {
  const { user } = useAuth();
  const initialLoadRef = useRef(false);
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
    error, setError,
    searchTimeout, setSearchTimeout
  } = useJobSearchState();

  // Use the Feature Access hook
  const accessData = useFeatureAccess(user?.id);
  
  // Set the feature access data - only once when accessData changes
  useEffect(() => {
    if (accessData && !initialLoadRef.current) {
      setHasAccess(accessData.hasAccess);
      setIsAccessLoading(accessData.isAccessLoading);
      setUserCompanyId(accessData.userCompanyId);
      initialLoadRef.current = true;
    }
  }, [accessData, setHasAccess, setIsAccessLoading, setUserCompanyId]);
  
  const { 
    searchJobs, 
    generateAiContactSuggestion, 
    loadSearchHistory 
  } = useJobSearchApi(userCompanyId, user?.id);

  // Load search history when user, access or company ID changes
  const fetchSearchHistory = useCallback(async () => {
    if (!user || !hasAccess || !userCompanyId) return;
    
    try {
      const history = await loadSearchHistory(user.id);
      setSearchHistory(history);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  }, [user, hasAccess, userCompanyId, loadSearchHistory, setSearchHistory]);

  // Only load search history once when component mounts and dependencies are available
  useEffect(() => {
    if (hasAccess && userCompanyId && !initialLoadRef.current && user?.id) {
      console.log('Loading search history for user:', user.id);
      fetchSearchHistory();
    }
  }, [fetchSearchHistory, hasAccess, userCompanyId, user?.id]);

  // Clear search timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    // Prevent default form submission which causes page refresh
    if (e) {
      e.preventDefault();
    }
    
    // Reset previous error state and clear any existing timeout
    setError(null);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    
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
    console.log('Starting job search with state:', { searchParams, userCompanyId, userId: user?.id });
    
    // Set a timeout to show a message if the search is taking too long
    const timeout = setTimeout(() => {
      toast({
        title: "Suche läuft noch",
        description: "Die Suche dauert länger als erwartet. Bitte haben Sie Geduld.",
        variant: "default"
      });
    }, 15000); // 15 seconds
    
    // Set a longer timeout to check if the search is still running after 45 seconds
    const longTimeout = setTimeout(() => {
      if (isLoading) {
        toast({
          title: "Suche dauert sehr lange",
          description: "Die Suche dauert ungewöhnlich lange. Sie können es später erneut versuchen.",
          variant: "default"
        });
      }
    }, 45000); // 45 seconds
    
    setSearchTimeout(timeout);
    
    try {
      console.log('Starting job search with params:', searchParams);
      const results = await searchJobs(searchParams);
      console.log('Search results received:', results);
      
      // Explicitly check if results is an array and has elements
      if (Array.isArray(results)) {
        setJobs(results);
        console.log('Jobs state updated with', results.length, 'items');
        
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
      } else {
        console.error('Search results is not an array:', results);
        setJobs([]);
        toast({
          title: "Unerwartetes Ergebnis",
          description: "Die Suche ergab ein unerwartetes Format. Bitte versuchen Sie es erneut.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error searching jobs:', error);
      setError(error.message || "Ein unbekannter Fehler ist aufgetreten");
      setJobs([]); // Ensure jobs is an empty array on error
      toast({
        title: "Fehler bei der Suche",
        description: error.message || "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
      clearTimeout(longTimeout);
      setIsLoading(false);
    }
  }, [isLoading, searchJobs, searchParams, searchTimeout, setError, setIsLoading, setJobs, setSearchTimeout, user?.id, userCompanyId]);

  const loadSearchResult = useCallback((record: JobOfferRecord) => {
    // Ensure the search results from the record are treated as an array
    const resultsArray = Array.isArray(record.search_results) ? record.search_results : [];
    setJobs(resultsArray);
    console.log('Loaded search results from history:', resultsArray);
    
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
  }, [setAiSuggestion, setIsSearchHistoryOpen, setJobs, setSearchParams]);

  const generateAiSuggestion = useCallback(async () => {
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
  }, [generateAiContactSuggestion, jobs, searchParams.query, setAiSuggestion, setIsAiModalOpen, setIsGeneratingAiSuggestion]);

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
