
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useClayWorkbookOperations = (companyId: string | null, userId: string | null) => {
  // Function to create a Clay workbook based on search criteria
  const createClayWorkbook = async (): Promise<string> => {
    try {
      console.log('Creating Clay workbook, companyId:', companyId, 'userId:', userId);
      
      // Check if we have a query to send
      const storedParams = localStorage.getItem('jobSearchParams');
      const searchQuery = storedParams ? JSON.parse(storedParams).query : null;
      
      if (!searchQuery) {
        console.warn('No search query found in localStorage');
        throw new Error('Keine Suchanfrage gefunden');
      }
      
      // Prepare request body with the necessary parameters
      const requestBody = {
        title: searchQuery,
        location: storedParams ? JSON.parse(storedParams).location : '',
        experience: storedParams ? JSON.parse(storedParams).experience : '',
        industry: storedParams ? JSON.parse(storedParams).industry : ''
      };
      
      console.log('Sending request to create-clay-workbook function with body:', JSON.stringify(requestBody));
      
      // Call the create-clay-workbook edge function with proper parameters
      const { data, error } = await supabase.functions.invoke('create-clay-workbook', {
        body: requestBody
      });
      
      console.log('Response from create-clay-workbook:', { 
        data: data ? JSON.stringify(data).substring(0, 200) + '...' : 'no data', 
        error: error ? JSON.stringify(error) : 'no error'
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
        console.log(`Generated ${data.suggestions.length} contact suggestions`);
        toast({
          title: "Erfolg",
          description: `${data.suggestions.length} Kontaktvorschläge wurden generiert`,
          variant: "default"
        });
        
        // Store suggestions in localStorage for rendering
        console.log('Storing suggestions in localStorage');
        localStorage.setItem('clayContactSuggestions', JSON.stringify(data.suggestions));
      } else {
        console.warn('No contact suggestions received from function');
        toast({
          title: "Hinweis",
          description: "Keine Kontaktvorschläge generiert",
          variant: "default"
        });
      }
      
      // Check if workbook URL is available and valid
      if (data.workbookUrl && data.workbookUrl.startsWith('http')) {
        console.log('Clay workbook URL received:', data.workbookUrl);
        
        // Ensure URL is a valid Clay app URL
        let workbookUrl = data.workbookUrl;
        if (!workbookUrl.includes('app.clay.com')) {
          workbookUrl = `https://app.clay.com/workbooks/${workbookUrl}`;
          console.log('Reformatted Clay workbook URL:', workbookUrl);
        }
        
        // Store workbook URL in localStorage
        localStorage.setItem('clayWorkbookUrl', workbookUrl);
        
        // Return the workbook URL
        return workbookUrl;
      } else {
        console.warn('No valid workbook URL received:', data.workbookUrl);
        return 'Kontaktvorschläge wurden generiert, aber kein Workbook-Link verfügbar';
      }
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
