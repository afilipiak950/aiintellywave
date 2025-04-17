
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';

export const useClayWorkbookOperations = (companyId: string | null, userId: string | null) => {
  const [isLoading, setIsLoading] = useState(false);

  // Create Clay workbook with job search results
  const createClayWorkbook = useCallback(async (): Promise<string> => {
    if (!userId) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    setIsLoading(true);
    
    try {
      console.log('Creating Clay workbook...');
      
      // Call Supabase Edge Function to create the workbook
      const { data, error } = await supabase.functions.invoke('create-clay-workbook', {
        body: { 
          userId,
          companyId
        }
      });
      
      if (error) {
        console.error('Error creating Clay workbook:', error);
        throw new Error(error.message || 'Fehler beim Erstellen des Clay Workbooks');
      }
      
      if (!data || !data.workbookUrl) {
        throw new Error('Keine Workbook-URL zurückgegeben');
      }
      
      console.log('Clay workbook created successfully:', data.workbookUrl);
      return data.workbookUrl;
    } catch (err) {
      console.error('Exception creating Clay workbook:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, companyId]);
  
  // Save current search to history
  const saveCurrentSearch = useCallback(async () => {
    if (!userId) {
      throw new Error('Benutzer nicht authentifiziert');
    }
    
    try {
      console.log('Saving current search...');
      
      // Get current search data from local storage or session
      const searchDataJson = localStorage.getItem('jobSearchData');
      if (!searchDataJson) {
        throw new Error('Keine Suchdaten gefunden');
      }
      
      const searchData = JSON.parse(searchDataJson);
      const { searchParams, jobs } = searchData;
      
      if (!searchParams?.query || !jobs || jobs.length === 0) {
        throw new Error('Keine gültigen Suchdaten gefunden');
      }
      
      // Save to database
      const { data, error } = await supabase
        .from('job_search_history')
        .insert({
          user_id: userId,
          company_id: companyId || null,
          search_query: searchParams.query,
          search_location: searchParams.location || '',
          search_experience: searchParams.experience || 'any',
          search_industry: searchParams.industry || '',
          search_results: jobs,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error saving search:', error);
        throw new Error(error.message || 'Fehler beim Speichern der Suche');
      }
      
      console.log('Search saved successfully with ID:', data?.id);
      return data?.id;
    } catch (err) {
      console.error('Exception saving search:', err);
      throw err;
    }
  }, [userId, companyId]);
  
  return {
    createClayWorkbook,
    saveCurrentSearch,
    isLoading
  };
};
