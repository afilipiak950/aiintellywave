
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCancelSearchString = () => {
  const cancelSearchString = async (id: string) => {
    try {
      // First update the status to 'canceled'
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Additionally call the cancel edge function (if exists)
      try {
        const { data: searchString, error: fetchError } = await supabase
          .from('search_strings')
          .select('*')
          .eq('id', id)
          .single();
          
        if (fetchError) throw fetchError;
        
        // If it's a website crawl, call the cancel function
        if (searchString.input_source === 'website') {
          const { error: functionError } = await supabase.functions.invoke('website-crawler-cancel', {
            body: { search_string_id: id }
          });
          
          if (functionError) console.warn('Error calling cancel function:', functionError);
        }
      } catch (functionCallError) {
        console.warn('Error calling cancel function:', functionCallError);
        // We don't throw here because the DB update is the important part
      }

      toast({
        title: 'Search string canceled',
        description: 'The search string processing has been canceled',
      });

      return true;
    } catch (error) {
      console.error('Error canceling search string:', error);
      toast({
        title: 'Failed to cancel search string',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    cancelSearchString
  };
};
