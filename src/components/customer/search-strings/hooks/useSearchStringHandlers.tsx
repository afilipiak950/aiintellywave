
import { useState, useCallback } from 'react';
import { useSearchStrings, SearchString, SearchStringStatus } from '@/hooks/search-strings/use-search-strings';
import { useToast } from '@/hooks/use-toast';

interface UseSearchStringHandlersProps {
  refetch: () => Promise<void>;
  onError?: (error: string | null) => void;
}

export const useSearchStringHandlers = ({ refetch, onError }: UseSearchStringHandlersProps) => {
  const { toast } = useToast();
  const { deleteSearchString, updateSearchString } = useSearchStrings();
  
  const [selectedString, setSelectedString] = useState<SearchString | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleManualRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      if (onError) onError(null);
      await refetch();
    } catch (error) {
      console.error('Error refreshing search strings:', error);
      if (onError) onError('Failed to refresh search strings');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, onError]);

  const handleOpenDetail = useCallback((searchString: SearchString) => {
    setSelectedString(searchString);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDialogOpen(false);
    // Allow animation to complete before removing the data
    setTimeout(() => {
      setSelectedString(null);
    }, 300);
  }, []);

  const handleUpdateSearchString = useCallback(async (id: string, generatedString: string) => {
    try {
      await updateSearchString(id, generatedString);
      handleCloseDetail();
      toast({
        title: 'Search String Updated',
        description: 'The search string has been updated successfully.',
      });
      return true;
    } catch (error) {
      console.error('Error updating search string:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update search string. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [updateSearchString, handleCloseDetail, toast]);

  const handleDeleteSearchString = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this search string?')) {
      try {
        await deleteSearchString(id);
        toast({
          title: 'Search String Deleted',
          description: 'The search string has been deleted successfully.',
        });
        refetch();
      } catch (error) {
        console.error('Error deleting search string:', error);
        toast({
          title: 'Deletion Failed',
          description: 'Failed to delete search string. Please try again.',
          variant: 'destructive',
        });
      }
    }
  }, [deleteSearchString, refetch, toast]);

  const handleCancelSearchString = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this search string generation?')) {
      try {
        setCancelingId(id);
        const { error } = await fetch('/api/search-strings/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        }).then(response => response.json());

        if (error) {
          throw new Error(error);
        }

        // Update the UI optimistically
        toast({
          title: 'Processing Canceled',
          description: 'The search string generation has been canceled.',
        });

        // Also update in Supabase directly as fallback
        const { data, error: updateError } = await fetch('/api/search-strings/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            status: 'canceled' as SearchStringStatus,
          }),
        }).then(response => response.json());

        if (updateError) {
          throw new Error(updateError);
        }

        refetch();
      } catch (error) {
        console.error('Error canceling search string:', error);
        toast({
          title: 'Cancellation Failed',
          description: 'Failed to cancel search string generation. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setCancelingId(null);
      }
    }
  }, [refetch, toast]);

  return {
    selectedString,
    isDialogOpen,
    isRefreshing,
    cancelingId,
    handleManualRefresh,
    handleOpenDetail,
    handleCloseDetail,
    handleUpdateSearchString,
    handleDeleteSearchString,
    handleCancelSearchString,
  };
};
