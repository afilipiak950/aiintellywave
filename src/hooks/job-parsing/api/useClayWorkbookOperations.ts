
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
      console.log('Creating Clay workbook with search criteria:', {
        searchTerm, 
        location, 
        ...additionalFilters
      });
      
      // Extract relevant fields for the API call
      const experience = additionalFilters.experience || '';
      const industry = additionalFilters.industry || '';
      
      // Call the create-clay-workbook edge function
      const { data, error } = await supabase.functions.invoke('create-clay-workbook', {
        body: {
          title: searchTerm,
          location,
          experience,
          industry
        }
      });
      
      if (error) {
        console.error('Error calling create-clay-workbook function:', error);
        toast({
          title: "Fehler",
          description: "Fehler bei der Kontaktvorschlag-Erstellung: " + (error.message || 'Unbekannter Fehler'),
          variant: "destructive"
        });
        throw new Error(error.message || 'Fehler beim Erstellen des Kontaktvorschlags');
      }
      
      if (!data || !data.success) {
        console.error('Invalid response from create-clay-workbook function:', data);
        toast({
          title: "Fehler",
          description: data?.error || 'Ungültige Antwort vom Server erhalten',
          variant: "destructive"
        });
        throw new Error(data?.error || 'Ungültige Antwort vom Server erhalten');
      }
      
      // Success handling
      if (data.suggestions && data.suggestions.length > 0) {
        toast({
          title: "Erfolg",
          description: `${data.suggestions.length} Kontaktvorschläge wurden generiert`,
          variant: "default"
        });
      }
      
      console.log('Clay workbook created successfully:', data);
      
      // Store suggestions in localStorage for rendering
      if (data.suggestions) {
        localStorage.setItem('clayContactSuggestions', JSON.stringify(data.suggestions));
      }
      
      // Return the workbook URL if available, otherwise return a success message
      return data.workbookUrl || 'Kontaktvorschläge erfolgreich generiert';
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
