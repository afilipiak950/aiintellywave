
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth/useAuth';
import { Job } from '@/types/job-parsing';
import { useJobSearchApi } from './api/useJobSearchApi';
import { SearchParams, initialSearchParams } from './state/useJobSearchState';
import { useCompanyId } from '@/hooks/company/useCompanyId';

export const useJobSearch = () => {
  // Initial search parameters
  const defaultSearchParams: SearchParams = {
    query: '',
    location: '',
    experience: 'any',
    industry: '',
    maxResults: 50
  };

  const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
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
  const [restoredFromSession, setRestoredFromSession] = useState<boolean>(false);

  const { user } = useAuth();
  const { toast } = useToast();
  
  const { companyId } = useCompanyId();
  
  const { 
    searchJobs, 
    generateAiContactSuggestion,
    loadSearchHistory,
    saveSearch,
    deleteSearch,
    getUserCompanyId,
    getStoredJobResults
  } = useJobSearchApi(companyId, user?.id || null);
  
  // Attempt to restore session on initial mount
  useEffect(() => {
    if (!restoredFromSession) {
      try {
        const { results, params } = getStoredJobResults();
        
        if (results && results.length > 0) {
          console.log('Restoring previous job search results from session storage:', results.length, 'jobs');
          setJobs(results);
          
          if (params) {
            console.log('Restoring previous search parameters:', params);
            setSearchParams(params);
          }
          
          // Show toast about restored session
          toast({
            title: "Sitzung wiederhergestellt",
            description: `${results.length} Jobangebote aus Ihrer letzten Suche wurden wiederhergestellt.`,
            duration: 4000,
          });
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      }
      
      setRestoredFromSession(true);
    }
  }, []);
  
  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        if (user?.id && companyId) {
          console.info(`Loading search history for user: ${user.id}`);
          console.info(`Loading job search history for user: ${user.id}`);
          const history = await loadSearchHistory(user.id, companyId);
          setSearchHistory(history);
        } else {
          console.info('Using guest mode, no search history available');
        }
      } catch (err: any) {
        console.error("Error loading search history:", err);
        // Don't show this error to the user as it's not critical
      }
    };
    
    const checkAccess = async () => {
      setIsAccessLoading(true);
      
      try {
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

  const handleParamChange = useCallback((key: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
    if (error) {
      setError(null);
    }
  }, [error]);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!searchParams.query.trim()) {
      setError("Bitte geben Sie einen Suchbegriff ein.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setJobs([]);
    
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
      const results = await searchJobs(searchParams);
      
      clearTimeout(longSearchTimeout);
      
      if (Array.isArray(results)) {
        setJobs(results);
        
        if (results.length === 0) {
          toast({
            title: "Keine Ergebnisse",
            description: "Für Ihre Suchkriterien wurden keine Jobangebote gefunden. Bitte versuchen Sie es mit anderen Suchbegriffen.",
            duration: 5000,
          });
        } else {
          toast({
            title: "Jobangebote gefunden",
            description: `Es wurden ${results.length} Jobangebote gefunden.`,
            duration: 3000,
          });
          
          setRetryCount(0);
        }
      } else {
        throw new Error("Ungültige Antwort vom Server");
      }
    } catch (err: any) {
      clearTimeout(longSearchTimeout);
      
      setError(err.message || "Bei der Suche ist ein Fehler aufgetreten.");
      console.error("Search error:", err);
      
      setRetryCount(prev => prev + 1);
      
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
      
      if (!showLongSearchMessage) {
        clearTimeout(longSearchTimeout);
      }
    }
  }, [searchParams, searchJobs, toast, retryCount]);

  const saveCurrentSearch = useCallback(async () => {
    if (!user?.id || !companyId) {
      toast({
        title: "Nicht angemeldet",
        description: "Sie müssen angemeldet sein, um Suchen zu speichern.",
        variant: "destructive"
      });
      return;
    }
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      toast({
        title: "Keine Jobangebote",
        description: "Es gibt keine Suchergebnisse zum Speichern.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Attempting to save search with:', {
        userId: user.id,
        companyId,
        jobCount: jobs.length
      });
      
      const savedId = await saveSearch(user.id, companyId, searchParams, jobs);
      
      if (savedId) {
        // Aktualisiere den Suchverlauf nach dem Speichern
        const updatedHistory = await loadSearchHistory(user.id, companyId);
        setSearchHistory(updatedHistory);
        
        toast({
          title: "Suche gespeichert",
          description: "Ihre Suche wurde erfolgreich gespeichert."
        });
      } else {
        throw new Error("Fehler beim Speichern der Suche");
      }
    } catch (err: any) {
      console.error("Error saving search:", err);
      toast({
        title: "Fehler",
        description: "Die Suche konnte nicht gespeichert werden: " + (err.message || 'Unbekannter Fehler'),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, companyId, searchParams, jobs, toast, saveSearch, loadSearchHistory]);

  const deleteSearchRecord = useCallback(async (recordId: string) => {
    try {
      const success = await deleteSearch(recordId);
      
      if (success) {
        // Aktualisiere den Suchverlauf nach dem Löschen
        if (user?.id && companyId) {
          const updatedHistory = await loadSearchHistory(user.id, companyId);
          setSearchHistory(updatedHistory);
        }
        
        toast({
          title: "Suche gelöscht",
          description: "Die gespeicherte Suche wurde gelöscht."
        });
      } else {
        throw new Error("Fehler beim Löschen der Suche");
      }
    } catch (err: any) {
      console.error("Error deleting search:", err);
      toast({
        title: "Fehler",
        description: "Die Suche konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  }, [user, companyId, toast, deleteSearch, loadSearchHistory]);

  const loadSearchResult = useCallback(async (recordId: string) => {
    try {
      const record = searchHistory.find(item => item.id === recordId);
      
      if (!record) {
        toast({
          title: "Fehler",
          description: "Suchergebnis nicht gefunden.",
          variant: "destructive",
        });
        return;
      }
      
      setSearchParams({
        query: record.search_query || "",
        location: record.search_location || "",
        experience: record.search_experience || "any",
        industry: record.search_industry || "",
      });
      
      if (record.search_results && Array.isArray(record.search_results)) {
        setJobs(record.search_results);
        
        toast({
          title: "Suchergebnis geladen",
          description: `${record.search_results.length} Jobangebote aus Ihrem Suchverlauf geladen.`,
        });
      } else {
        handleSearch();
      }
      
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

  const generateAiSuggestion = useCallback(async () => {
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
    isSaving,
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
    saveCurrentSearch,
    loadSearchResult,
    deleteSearchRecord,
    setSelectedJob,
    setIsSearchHistoryOpen,
    setIsAiModalOpen,
    generateAiSuggestion,
  };
};
