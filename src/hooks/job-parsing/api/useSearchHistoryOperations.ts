
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobSearchHistory } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';

export const useSearchHistoryOperations = (companyId: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Load search history for a user
  const loadSearchHistory = useCallback(async (userId: string, companyId: string): Promise<JobSearchHistory[]> => {
    if (!companyId || !userId) {
      return [];
    }
    
    setIsLoading(true);
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
      
      // Transform the search_results from Json to Job[] type
      const typedResults = data?.map(item => ({
        ...item,
        search_results: Array.isArray(item.search_results) ? item.search_results : []
      })) as JobSearchHistory[] || [];
      
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
    if (!companyId || !userId) {
      toast({
        title: 'Fehler beim Speichern',
        description: 'Keine Company-ID oder Benutzer-ID gefunden',
        variant: 'destructive'
      });
      return null;
    }
    
    if (!query || jobs.length === 0) {
      toast({
        title: 'Keine Suche gefunden',
        description: 'Es gibt keine Suchanfrage oder Ergebnisse zum Speichern',
        variant: 'destructive'
      });
      return null;
    }
    
    setIsLoading(true);
    try {
      // Need to cast the jobs array to a JSON compatible format for Supabase
      const { data, error } = await supabase
        .from('job_search_history')
        .insert({
          user_id: userId,
          company_id: companyId,
          search_query: query,
          search_location: location,
          search_experience: experience,
          search_industry: industry,
          search_results: jobs as any // Use type assertion to bypass type checking
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
      setIsLoading(false);
    }
  }, []);
  
  // Delete a search record
  const deleteSearch = useCallback(async (id: string): Promise<boolean> => {
    if (!id) return false;
    
    setIsLoading(true);
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
    loadSearchHistory,
    saveSearch,
    deleteSearch
  };
};
