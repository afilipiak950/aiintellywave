
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
    error, setError,
    searchTimeout, setSearchTimeout
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
      if (!user || !hasAccess) return;
      
      try {
        // Even without a company ID, we still try to fetch history
        // as some users might not have a company association yet
        const history = await loadSearchHistory(user.id);
        setSearchHistory(history || []);
      } catch (error) {
        console.error('Error fetching search history:', error);
        // No need to show errors for history loading
      }
    };
    
    if (hasAccess && user?.id) {
      fetchSearchHistory();
    }
  }, [user, hasAccess, loadSearchHistory, setSearchHistory]);

  // Clear search timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = async (e?: React.FormEvent) => {
    // Prevent default form submission
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
    console.log('Starting job search with parameters:', {
      query: searchParams.query,
      location: searchParams.location,
      experience: searchParams.experience,
      industry: searchParams.industry
    });
    
    // Set a timeout to show a message if the search is taking too long
    const timeout = setTimeout(() => {
      if (isLoading) {
        toast({
          title: "Suche läuft noch",
          description: "Die Suche dauert länger als erwartet. Bitte haben Sie Geduld.",
          variant: "default"
        });
      }
    }, 15000); // 15 seconds
    
    setSearchTimeout(timeout);
    
    // Set a maximum search time of 60 seconds before timing out
    const maxSearchTime = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        clearTimeout(timeout);
        setSearchTimeout(null);
        setError("Die Suche wurde wegen Zeitüberschreitung abgebrochen. Bitte versuchen Sie es mit anderen Suchkriterien.");
        toast({
          title: "Zeitüberschreitung",
          description: "Die Suche wurde nach 60 Sekunden abgebrochen. Bitte versuchen Sie es mit anderen Suchkriterien.",
          variant: "destructive"
        });
      }
    }, 60000); // 60 seconds timeout
    
    try {
      const results = await searchJobs(searchParams);
      
      // Explicitly check if results is an array and has elements
      if (Array.isArray(results)) {
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
      // Create a user-friendly error message
      let errorMessage = "Ein unbekannter Fehler ist aufgetreten";
      
      if (error.message) {
        if (error.message.includes('API-Fehler: 400')) {
          errorMessage = "Der Suchdienst konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie einen einfacheren Suchbegriff.";
        } else if (error.message.includes('did not succeed')) {
          errorMessage = "Die Jobsuche ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setJobs([]);
      
      toast({
        title: "Fehler bei der Suche",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      clearTimeout(timeout);
      clearTimeout(maxSearchTime);
      setSearchTimeout(null);
      setIsLoading(false);
    }
  };

  const loadSearchResult = (record: JobOfferRecord) => {
    // Ensure the search results from the record are treated as an array
    const resultsArray = Array.isArray(record.search_results) ? record.search_results : [];
    setJobs(resultsArray);
    
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
    
    toast({
      title: "Suchverlauf geladen",
      description: `Suche nach "${record.search_query}" wurde geladen.`,
    });
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
