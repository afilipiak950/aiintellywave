
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseSearchStringManagementProps {
  fetchSearchStrings: () => Promise<void>;
}

export const useSearchStringManagement = ({ fetchSearchStrings }: UseSearchStringManagementProps) => {
  const { toast } = useToast();

  const deleteSearchString = async (id: string) => {
    try {
      const { error } = await supabase
        .from('search_strings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Search string deleted',
        description: 'The search string has been successfully deleted',
      });
      
      await fetchSearchStrings();
      return true;
    } catch (error) {
      console.error('Error deleting search string:', error);
      toast({
        title: 'Failed to delete search string',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateSearchString = async (id: string, generatedString: string) => {
    try {
      const { error } = await supabase
        .from('search_strings')
        .update({ 
          generated_string: generatedString,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Search string updated',
        description: 'The search string has been successfully updated',
      });
      
      await fetchSearchStrings();
      return true;
    } catch (error) {
      console.error('Error updating search string:', error);
      toast({
        title: 'Failed to update search string',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  const markAsProcessed = async (id: string, user: any = null) => {
    try {
      const updateData: any = { 
        is_processed: true, 
        processed_at: new Date().toISOString()
      };
      
      if (user) {
        updateData.processed_by = user.id;
      }
      
      const { error } = await supabase
        .from('search_strings')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Search string marked as processed',
        description: 'The search string has been marked as processed',
      });
      
      await fetchSearchStrings();
      return true;
    } catch (error) {
      console.error('Error marking search string as processed:', error);
      toast({
        title: 'Failed to update search string',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleSearchStringFeature = async (companyId: string, enable: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ enable_search_strings: enable })
        .eq('id', companyId);
      
      if (error) throw error;
      
      toast({
        title: enable ? 'Feature enabled' : 'Feature disabled',
        description: `Search string feature has been ${enable ? 'enabled' : 'disabled'} for this company`,
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling search string feature:', error);
      toast({
        title: 'Failed to update company settings',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    deleteSearchString,
    updateSearchString,
    markAsProcessed,
    toggleSearchStringFeature,
    refetch: fetchSearchStrings
  };
};
