import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { getUserCompanyId } from '@/utils/auth-utils';
import { initialSearchParams, SearchParams } from './state/useJobSearchState';
import { useJobSearchApi } from './api/useJobSearchApi';
import { Job, JobSearchHistory } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Clay workbook state
  const [isCreatingClayWorkbook, setIsCreatingClayWorkbook] = useState(false);
  
  // API hooks
  const api = useJobSearchApi(companyId, user?.id);
  
  // Check access on mount
  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsAccessLoading(true);
        
        if (user?.id) {
          console.log("User is authenticated:", user.id);
          
          // Try to get company ID but don't require it
          let userCompanyId = null;
          
          try {
            userCompanyId = await getUserCompanyId();
            console.log("Retrieved company ID:", userCompanyId);
          } catch (err) {
            console.log("Could not retrieve company ID, will continue with user ID only:", err);
          }
          
          // Set company ID even if null
          setCompanyId(userCompanyId);
          
          // Always set hasAccess to true when user is authenticated
          setHasAccess(true);
          console.log(`[JobParsing] Granting access for user ${user.id}`);
          
          // Only load search history if we have a user ID - don't require company ID
          if (user.id) {
            // We'll load search history based on user ID only
            const history = await api.loadSearchHistory(user.id, null);
            setSearchHistory(history);
            console.log("Loaded search history:", history.length, "items");
          }
          
          // Get stored results from session storage (in case of page refresh)
          const { results, params } = api.getStoredJobResults();
          if (results && results.length > 0) {
            setJobs(results);
            
            if (params) {
              setSearchParams(params);
            }
          }
        } else {
          console.log("No authenticated user found");
          // Default to allowing access even without user ID
          setHasAccess(true);
        }
      } catch (err) {
        console.error('Error checking access:', err);
        // Default to allowing access if there's an error
        setHasAccess(true);
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
    
    // Remove authentication check - allow search without user or company ID
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
  }, [searchParams, api]);
  
  // Save current search - use only user ID and don't require company ID
  const saveCurrentSearch = useCallback(async () => {
    console.log("saveCurrentSearch called, user:", user?.id, "companyId:", companyId);
    
    // If no user ID, show message
    if (!user?.id) {
      console.log("No user ID - can't save search");
      toast({
        title: 'Hinweis',
        description: 'Sie müssen angemeldet sein, um die Suche zu speichern',
        variant: 'default'
      });
      return;
    }
    
    if (!searchParams.query || jobs.length === 0) {
      console.log("No search query or jobs - can't save search");
      toast({
        title: 'Keine Suche verfügbar',
        description: 'Bitte führen Sie zuerst eine Suche durch',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSaving(true);
    console.log("Saving search with params:", searchParams, "user ID:", user.id, "and jobs:", jobs.length);
    
    try {
      await api.saveSearch(
        user.id,
        companyId, // Pass the company ID, it will be handled properly in the saveSearch function
        searchParams.query,
        searchParams.location,
        searchParams.experience,
        searchParams.industry,
        jobs
      );
      
      console.log("Search saved successfully, refreshing history");
      // Refresh search history based on user ID only
      const history = await api.loadSearchHistory(user.id, null);
      setSearchHistory(history);
      
      toast({
        title: 'Suche gespeichert',
        description: `${jobs.length} Jobangebote wurden gespeichert`,
        variant: 'default'
      });
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
      
      if (success && user?.id) {
        // Refresh search history based on user ID only
        const history = await api.loadSearchHistory(user.id, null);
        setSearchHistory(history);
      }
    } catch (err) {
      console.error('Error deleting search record:', err);
    }
  }, [user?.id, api]);
  
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
  
  // Create Clay workbook
  const createClayWorkbook = useCallback(async () => {
    if (!searchParams.query) {
      toast({
        title: 'Keine Suche verfügbar',
        description: 'Bitte führen Sie zuerst eine Suche durch',
        variant: 'destructive'
      });
      return;
    }
    
    setIsCreatingClayWorkbook(true);
    
    try {
      const workbookUrl = await api.createClayWorkbook();
      
      // Open the Clay workbook in a new tab
      if (workbookUrl && workbookUrl.startsWith('http')) {
        window.open(workbookUrl, '_blank');
      }
      
      toast({
        title: 'Kontaktvorschläge erstellt',
        description: 'Kontaktvorschläge wurden erfolgreich generiert',
        variant: 'default'
      });
    } catch (err) {
      console.error('Error creating Clay workbook:', err);
      toast({
        title: 'Fehler',
        description: err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingClayWorkbook(false);
    }
  }, [searchParams.query, api]);
  
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
    isCreatingClayWorkbook,
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
    generateAiSuggestion,
    createClayWorkbook
  };
};
