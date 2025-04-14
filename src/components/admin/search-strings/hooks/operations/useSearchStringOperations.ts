
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchString } from '@/hooks/search-strings/search-string-types';

export const useSearchStringOperations = () => {
  const { toast } = useToast();

  // Mark a search string as processed
  const markAsProcessed = async (
    id: string, 
    e: React.MouseEvent,
    searchStrings: SearchString[],
    setSearchStrings: (strings: SearchString[]) => void
  ) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('search_strings')
        .update({ 
          is_processed: true, 
          processed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error marking search string as processed:', error);
        toast({
          title: 'Failed to update',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      // Update the local state
      setSearchStrings(
        searchStrings.map(item => 
          item.id === id ? { ...item, is_processed: true, processed_at: new Date().toISOString() } : item
        )
      );
      
      toast({
        title: 'Marked as processed',
        description: 'Search string has been marked as processed',
      });
    } catch (error: any) {
      console.error('Error in markAsProcessed:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Create a new project from a search string
  const handleCreateProject = (searchString: SearchString, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/admin/projects/new?search_string_id=${searchString.id}`;
  };

  return { markAsProcessed, handleCreateProject };
};
