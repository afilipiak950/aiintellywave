
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchString, SearchStringStatus } from '../search-string-types';

export const useCancelSearchString = () => {
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelSearchString = async (searchStringId: string) => {
    try {
      setIsCancelling(true);
      
      const { error } = await supabase
        .from('search_strings')
        .update({ status: 'canceled' as SearchStringStatus })
        .eq('id', searchStringId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Search string cancelled',
        description: 'Your search string has been cancelled successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error cancelling search string:', error);
      toast({
        title: 'Failed to cancel search string',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    cancelSearchString,
    isCancelling,
  };
};
