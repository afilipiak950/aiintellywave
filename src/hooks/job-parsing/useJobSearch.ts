
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { getUserCompanyId } from '@/utils/auth-utils';
import { initialSearchParams, SearchParams } from './state/useJobSearchState';
import { useJobSearchApi } from './api/useJobSearchApi';
import { Job, JobSearchHistory } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';

export const useJobSearch = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAccessLoading, setIsAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Search state
  const [searchParams, setSearchParams] = useState<SearchParams>(initialSearchParams);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Job detail state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // AI suggestion state
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingAiSuggestion, setIsGeneratingAiSuggestion] = useState(false);
  
  // Search history state
  const [searchHistory, setSearchHistory] = useState<JobSearchHistory[]>([]);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // API hooks
  const api = useJobSearchApi(companyId, user?.id);
  
  // Check company access on mount
  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsAccessLoading(true);
        
        if (user?.id) {
          const userCompanyId = await getUserCompanyId();
          
          if (userCompanyId) {
            setCompanyId(userCompanyId);
            setHasAccess(true);
            
            // Load search history
            const history = await api.loadSearchHistory(user.id, userCompanyId);
            setSearchHistory(history);
            
            // Get stored results from session storage (in case of page refresh)
            const { results, params } = api.getStoredJobResults();
            if (results && results.length > 0) {
              setJobs(results);
              
              if (params) {
                setSearchParams(params);
              }
            }
          } else {
            console.error('No company ID found for user');
            setHasAccess(false);
          }
        } else {
          setHasAccess(false);
        }
      } catch (err) {
        console.error('Error checking access:', err);
        setHasAccess(false);
      } finally {
        setIsAccessLoading(false);
      }
    };
    
    checkAccess();
  }, [user?.id]);
  
  // Handle search parameter changes
  const handleParamChange = useCallback((name: string, value: string | number) => {
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // Perform job search
  const handleSearch = useCallback(async () => {
    if (!searchParams.query) {
      setError('Bitte geben Sie einen Suchbegriff ein');
      return;
    }
    
    if (!user?.id || !companyId) {
      setError('Nicht authentifiziert. Bitte melden Sie sich an.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await api.searchJobs(searchParams);
      setJobs(results);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, user?.id, companyId, api]);
  
  // Save current search
  const saveCurrentSearch = useCallback(async () => {
    if (!user?.id || !companyId) {
      toast({
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein, um eine Suche zu speichern',
        variant: 'destructive'
      });
      return;
    }
    
    if (!searchParams.query || jobs.length === 0) {
      toast({
        title: 'Keine Suche verfügbar',
        description: 'Bitte führen Sie zuerst eine Suche durch',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await api.saveSearch(
        user.id,
        companyId,
        searchParams.query,
        searchParams.location,
        searchParams.experience,
        searchParams.industry,
        jobs
      );
      
      // Refresh search history
      const history = await api.loadSearchHistory(user.id, companyId);
      setSearchHistory(history);
    } catch (err) {
      console.error('Error saving search:', err);
      toast({
        title: 'Fehler beim Speichern',
        description: err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, companyId, searchParams, jobs, api]);
  
  // Load a saved search
  const loadSearchResult = useCallback(async (record: JobSearchHistory) => {
    if (!record || !record.search_results) {
      toast({
        title: 'Keine Daten',
        description: 'Die gespeicherte Suche enthält keine Ergebnisse',
        variant: 'destructive'
      });
      return;
    }
    
    // Update search parameters
    setSearchParams({
      query: record.search_query,
      location: record.search_location || '',
      experience: record.search_experience as any || 'any',
      industry: record.search_industry || '',
      maxResults: 50
    });
    
    // Update jobs
    setJobs(record.search_results);
    
    // Close history modal if open
    setIsSearchHistoryOpen(false);
    
    toast({
      title: 'Suche geladen',
      description: `${record.search_results.length} Jobangebote geladen`,
      variant: 'default'
    });
    
    // If AI suggestion exists, make it available
    if (record.ai_contact_suggestion) {
      setAiSuggestion(record.ai_contact_suggestion);
    }
  }, []);
  
  // Delete a saved search
  const deleteSearchRecord = useCallback(async (id: string) => {
    if (!id) return;
    
    try {
      const success = await api.deleteSearch(id);
      
      if (success && user?.id && companyId) {
        // Refresh search history
        const history = await api.loadSearchHistory(user.id, companyId);
        setSearchHistory(history);
      }
    } catch (err) {
      console.error('Error deleting search record:', err);
    }
  }, [user?.id, companyId, api]);
  
  // Generate AI contact suggestion
  const generateAiSuggestion = useCallback(async () => {
    if (jobs.length === 0) {
      toast({
        title: 'Keine Jobs',
        description: 'Bitte führen Sie zuerst eine Suche durch',
        variant: 'destructive'
      });
      return;
    }
    
    setIsGeneratingAiSuggestion(true);
    
    try {
      const suggestion = await api.generateAiContactSuggestion(jobs, searchParams.query);
      setAiSuggestion(suggestion);
      setIsAiModalOpen(true);
    } catch (err) {
      console.error('Error generating AI suggestion:', err);
      toast({
        title: 'Fehler',
        description: err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingAiSuggestion(false);
    }
  }, [jobs, searchParams.query, api]);
  
  return {
    // State
    isLoading,
    isSaving,
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
    retryCount,
    
    // Actions
    handleParamChange,
    handleSearch,
    saveCurrentSearch,
    loadSearchResult,
    deleteSearchRecord,
    setSelectedJob,
    setIsSearchHistoryOpen,
    setIsAiModalOpen,
    generateAiSuggestion
  };
};
