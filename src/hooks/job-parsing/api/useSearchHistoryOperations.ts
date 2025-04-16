
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobSearchHistory } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';

export const useSearchHistoryOperations = (companyId: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load search history for a user
  const loadSearchHistory = useCallback(async (userId: string, companyId: string): Promise<JobSearchHistory[]> => {
    if (!companyId || !userId) {
      console.log("loadSearchHistory: Missing companyId or userId", { companyId, userId });
      return [];
    }
    
    setIsLoading(true);
    console.log(`Loading search history for user ${userId} in company ${companyId}`);
    
    try {
      const { data, error } = await supabase
        .from('job_search_history')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error loading search history:', error);
        return [];
      }
      
      console.log(`Retrieved ${data?.length || 0} search history records`);
      
      // Transform the data to ensure proper typing
      const typedResults = data?.map(item => {
        // Ensure search_results is an array of Job objects
        let searchResults: Job[] = [];
        
        if (Array.isArray(item.search_results)) {
          // Map each JSON result to Job type with validation
          searchResults = item.search_results.map((jobData: any) => ({
            title: jobData.title || '',
            company: jobData.company || '',
            location: jobData.location || '',
            description: jobData.description || '',
            url: jobData.url || '',
            datePosted: jobData.datePosted || null,
            salary: jobData.salary || null,
            employmentType: jobData.employmentType || null,
            source: jobData.source || 'Google Jobs',
            directApplyLink: jobData.directApplyLink || null
          }));
        }
        
        return {
          ...item,
          search_results: searchResults
        } as JobSearchHistory;
      }) || [];
      
      return typedResults;
    } catch (error) {
      console.error('Exception loading search history:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Save a search to the history
  const saveSearch = useCallback(async (
    userId: string, 
    companyId: string, 
    query: string, 
    location: string | undefined, 
    experience: string | undefined,
    industry: string | undefined,
    jobs: Job[]
  ): Promise<string | null> => {
    console.log("saveSearch called with:", { userId, companyId, query, jobs: jobs.length });
    
    if (!companyId) {
      console.error("Cannot save search - missing companyId", { companyId, userId });
      toast({
        title: 'Fehler beim Speichern',
        description: 'Keine Firma zugeordnet. Bitte kontaktieren Sie den Administrator.',
        variant: 'destructive'
      });
      return null;
    }
    
    if (!userId) {
      console.error("Cannot save search - missing userId", { companyId, userId });
      toast({
        title: 'Fehler beim Speichern',
        description: 'Bitte melden Sie sich an, um Suchen zu speichern',
        variant: 'destructive'
      });
      return null;
    }
    
    if (!query || jobs.length === 0) {
      console.error("Cannot save search - missing query or jobs", { query, jobsLength: jobs.length });
      toast({
        title: 'Keine Suche gefunden',
        description: 'Es gibt keine Suchanfrage oder Ergebnisse zum Speichern',
        variant: 'destructive'
      });
      return null;
    }
    
    setIsSaving(true);
    console.log("Preparing to save search to database...");
    
    try {
      // Convert Job[] to a format that Supabase can handle
      const serializableJobs = jobs.map(job => ({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        url: job.url,
        datePosted: job.datePosted || null,
        salary: job.salary || null,
        employmentType: job.employmentType || null,
        source: job.source || 'Google Jobs',
        directApplyLink: job.directApplyLink || null
      }));
      
      console.log("Inserting search into job_search_history:", { 
        user_id: userId,
        company_id: companyId,
        search_query: query
      });
      
      const { data, error } = await supabase
        .from('job_search_history')
        .insert({
          user_id: userId,
          company_id: companyId,
          search_query: query,
          search_location: location || '',
          search_experience: experience || 'any',
          search_industry: industry || '',
          search_results: serializableJobs,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Error saving search:', error);
        toast({
          title: 'Fehler beim Speichern',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }
      
      console.log("Search saved successfully with ID:", data?.id);
      toast({
        title: 'Suche gespeichert',
        description: `${jobs.length} Jobangebote wurden gespeichert`,
        variant: 'default'
      });
      
      return data?.id || null;
    } catch (error) {
      console.error('Exception saving search:', error);
      toast({
        title: 'Fehler beim Speichern',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Delete a saved search
  const deleteSearch = useCallback(async (id: string): Promise<boolean> => {
    if (!id) return false;
    
    setIsLoading(true);
    console.log(`Deleting search record with ID: ${id}`);
    
    try {
      const { error } = await supabase
        .from('job_search_history')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting search record:', error);
        toast({
          title: 'Fehler beim Löschen',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
      console.log("Search record deleted successfully");
      toast({
        title: 'Gespeicherte Suche gelöscht',
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Exception deleting search record:', error);
      toast({
        title: 'Fehler beim Löschen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    isLoading,
    isSaving,
    loadSearchHistory,
    saveSearch,
    deleteSearch
  };
};
