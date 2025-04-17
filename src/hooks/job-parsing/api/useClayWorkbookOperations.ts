
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';

export const useClayWorkbookOperations = (companyId: string | null, userId: string | null) => {
  // Function to create a Clay workbook based on search criteria
  const createClayWorkbook = async (
    searchTerm: string,
    location: string = '',
    additionalFilters: Record<string, any> = {}
  ): Promise<string> => {
    try {
      if (!userId) {
        console.error('No user ID available');
        throw new Error('Sie müssen angemeldet sein, um diese Funktion zu nutzen');
      }
      
      console.log('Creating Clay workbook with search criteria:', {
        searchTerm, 
        location, 
        ...additionalFilters
      });
      
      // Call the create-clay-workbook edge function
      const { data, error } = await supabase.functions.invoke('create-clay-workbook', {
        body: {
          user_id: userId,
          company_id: companyId,
          search_term: searchTerm,
          location: location,
          ...additionalFilters
        }
      });
      
      if (error) {
        console.error('Error calling create-clay-workbook function:', error);
        throw new Error(error.message || 'Fehler beim Erstellen des Clay Workbooks');
      }
      
      if (!data || !data.success || !data.workbook_url) {
        console.error('Invalid response from create-clay-workbook function:', data);
        throw new Error('Ungültige Antwort vom Server erhalten');
      }
      
      console.log('Clay workbook created successfully:', data.workbook_url);
      
      return data.workbook_url;
    } catch (error) {
      console.error('Error creating Clay workbook:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten',
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    createClayWorkbook
  };
};
