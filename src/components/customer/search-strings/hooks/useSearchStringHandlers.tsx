
import { useState } from 'react';
import { useSearchStrings, SearchString } from '@/hooks/search-strings/use-search-strings';
import { useToast } from '@/hooks/use-toast';
import { cancelSearchString } from '@/hooks/search-strings/operations/use-cancel-search-string';

export const useSearchStringHandlers = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isMarkingAsProcessed, setIsMarkingAsProcessed] = useState(false);
  const { deleteSearchString, markAsProcessed, refetch } = useSearchStrings();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteSearchString(id);
      
      toast({
        title: "Search string deleted",
        description: "The search string has been successfully deleted.",
      });
    } catch (error) {
      console.error('Failed to delete search string:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the search string.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setIsCanceling(true);
      await cancelSearchString(id);
      await refetch(); // Refresh the list
      
      toast({
        title: "Processing canceled",
        description: "Search string processing has been canceled.",
      });
    } catch (error) {
      console.error('Failed to cancel processing:', error);
      toast({
        title: "Cancel failed",
        description: "There was an error canceling the processing.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleMarkAsProcessed = async (searchString: SearchString) => {
    try {
      setIsMarkingAsProcessed(true);
      await markAsProcessed(searchString.id);
      
      toast({
        title: "Marked as processed",
        description: "Search string has been marked as processed.",
      });
    } catch (error) {
      console.error('Failed to mark as processed:', error);
      toast({
        title: "Operation failed",
        description: "There was an error marking the search string as processed.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingAsProcessed(false);
    }
  };

  return {
    handleDelete,
    handleCancel,
    handleMarkAsProcessed,
    isDeleting,
    isCanceling,
    isMarkingAsProcessed,
  };
};
