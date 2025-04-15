
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCompanyId } from '@/hooks/company/useCompanyId';
import { Job } from '@/types/job-parsing';
import { useJobSearchApi } from './api/useJobSearchApi';
import { SearchParams, initialSearchParams } from './state/useJobSearchState';

export const useJobSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>(initialSearchParams);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isGeneratingAiSuggestion, setIsGeneratingAiSuggestion] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [hasAccess, setHasAccess] = useState<boolean>(true);
  const [isAccessLoading, setIsAccessLoading] = useState<boolean>(true);

  const { user } = useAuth();
  const { companyId } = useCompanyId();
  const { toast } = useToast();
  
  // Get the API functions
  const { 
    searchJobs, 
    generateAiContactSuggestion,
    loadSearchHistory,
    getUserCompanyId
  } = useJobSearchApi(companyId, user?.id || null);
  
  // Load search history on mount
  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        if (user?.id && companyId) {
          console.info(`Loading search history for user: ${user.id}`);
          console.info(`Loading job search history for user: ${user.id}`);
          const history = await loadSearchHistory(user.id, companyId);
          setSearchHistory(history);
        }
      } catch (err: any) {
        console.error("Error loading search history:", err);
        // Don't show this error to the user as it's not critical
      }
    };
    
    // Check access and load search history
    const checkAccess = async () => {
      setIsAccessLoading(true);
      
      try {
        // Allow access for now
        setHasAccess(true);
        await fetchSearchHistory();
      } catch (error) {
        console.error("Error checking access:", error);
        setHasAccess(true); // Default to allowing access on error
      } finally {
        setIsAccessLoading(false);
      }
    };
    
    checkAccess();
  }, [user, companyId]);

  // Handle search parameter change
  const handleParamChange = useCallback((key: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
    // Reset error when user changes params
    if (error) {
      setError(null);
    }
  }, [error]);

  // Handle job search
  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validate search query
    if (!searchParams.query.trim()) {
      setError("Bitte geben Sie einen Suchbegriff ein.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setJobs([]);
    
    // Track if we need to show a "taking longer than expected" message
    let showLongSearchMessage = false;
    const longSearchTimeout = setTimeout(() => {
      showLongSearchMessage = true;
      toast({
        title: "Suche läuft noch",
        description: "Die Suche dauert länger als erwartet. Bitte haben Sie Geduld.",
        duration: 5000,
      });
    }, 8000);
    
    try {
      // Execute the search
      const results = await searchJobs(searchParams);
      
      // Clear the timeout
      clearTimeout(longSearchTimeout);
      
      if (Array.isArray(results)) {
        setJobs(results);
        
        if (results.length === 0) {
          // No results found
          toast({
            title: "Keine Ergebnisse",
            description: "Für Ihre Suchkriterien wurden keine Jobangebote gefunden. Bitte versuchen Sie es mit anderen Suchbegriffen.",
            duration: 5000,
          });
        } else {
          // Success message
          toast({
            title: "Jobangebote gefunden",
            description: `Es wurden ${results.length} Jobangebote gefunden.`,
            duration: 3000,
          });
          
          // Reset retry count on success
          setRetryCount(0);
        }
      } else {
        throw new Error("Ungültige Antwort vom Server");
      }
    } catch (err: any) {
      // Clear the timeout
      clearTimeout(longSearchTimeout);
      
      // Show error message
      setError(err.message || "Bei der Suche ist ein Fehler aufgetreten.");
      console.error("Search error:", err);
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
      
      // Show different toast based on retry count
      if (retryCount > 2) {
        toast({
          title: "Fehler bei der Suche",
          description: "Die Suche konnte mehrfach nicht erfolgreich abgeschlossen werden. Bitte versuchen Sie es mit einfacheren Suchbegriffen.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Fehler bei der Suche",
          description: err.message || "Bei der Suche ist ein Fehler aufgetreten.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
      
      // Cancel the timeout if it hasn't fired yet
      if (!showLongSearchMessage) {
        clearTimeout(longSearchTimeout);
      }
    }
  }, [searchParams, searchJobs, toast, retryCount]);

  // Load a search result from history
  const loadSearchResult = useCallback(async (recordId: string) => {
    try {
      // Find the record in search history
      const record = searchHistory.find(item => item.id === recordId);
      
      if (!record) {
        toast({
          title: "Fehler",
          description: "Suchergebnis nicht gefunden.",
          variant: "destructive",
        });
        return;
      }
      
      // Update search params from the record
      setSearchParams({
        query: record.search_query || "",
        location: record.search_location || "",
        experience: record.search_experience || "any",
        industry: record.search_industry || "",
      });
      
      // Load the job results
      if (record.search_results && Array.isArray(record.search_results)) {
        setJobs(record.search_results);
        
        toast({
          title: "Suchergebnis geladen",
          description: `${record.search_results.length} Jobangebote aus Ihrem Suchverlauf geladen.`,
        });
      } else {
        // If results aren't stored, perform the search again
        handleSearch();
      }
      
      // Close history modal
      setIsSearchHistoryOpen(false);
    } catch (err: any) {
      console.error("Error loading search result:", err);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden des Suchergebnisses.",
        variant: "destructive",
      });
    }
  }, [searchHistory, handleSearch, toast]);

  // Generate AI contact suggestion
  const generateAiSuggestion = useCallback(async () => {
    // Check if we have jobs
    if (!Array.isArray(jobs) || jobs.length === 0) {
      toast({
        title: "Keine Jobangebote",
        description: "Bitte führen Sie zuerst eine Suche durch.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingAiSuggestion(true);
    
    try {
      const suggestion = await generateAiContactSuggestion(jobs, searchParams.query);
      
      if (suggestion) {
        setAiSuggestion(suggestion);
        setIsAiModalOpen(true);
        toast({
          title: "KI-Vorschlag generiert",
          description: "Der KI-Kontaktvorschlag wurde erfolgreich erstellt.",
        });
      } else {
        throw new Error("Keine Vorschläge generiert");
      }
    } catch (err: any) {
      console.error("Error generating AI suggestion:", err);
      toast({
        title: "Fehler",
        description: "Fehler bei der Generierung des KI-Vorschlags.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAiSuggestion(false);
    }
  }, [jobs, searchParams.query, generateAiContactSuggestion, toast]);

  return {
    searchParams,
    jobs,
    isLoading,
    error,
    selectedJob,
    searchHistory,
    isSearchHistoryOpen,
    aiSuggestion,
    isAiModalOpen,
    isGeneratingAiSuggestion,
    hasAccess,
    isAccessLoading,
    retryCount,
    handleParamChange,
    handleSearch,
    loadSearchResult,
    setSelectedJob,
    setIsSearchHistoryOpen,
    setIsAiModalOpen,
    generateAiSuggestion,
  };
};
