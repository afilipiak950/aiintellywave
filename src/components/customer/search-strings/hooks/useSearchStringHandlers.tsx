
import { useState } from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseSearchStringHandlersProps {
  refetch: () => Promise<void>;
  deleteSearchString: (id: string) => Promise<void>;
  updateSearchString: (id: string, generatedString: string) => Promise<boolean>;
  onError?: (error: string | null) => void;
}

export const useSearchStringHandlers = ({
  refetch,
  deleteSearchString,
  updateSearchString,
  onError
}: UseSearchStringHandlersProps) => {
  const { toast } = useToast();
  const [selectedString, setSelectedString] = useState<SearchString | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Search strings refreshed",
        description: "The list has been updated with the latest data",
      });
    } catch (error) {
      console.error('Error during manual refresh:', error);
      if (onError) onError('Error refreshing search string data');
      toast({
        variant: "destructive",
        title: "Refresh failed",
        description: "Could not refresh search strings. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopy = (searchString: string) => {
    navigator.clipboard.writeText(searchString);
    toast({
      title: 'Copied to clipboard',
      description: 'Search string has been copied to your clipboard',
    });
  };

  const handleOpenDetail = (searchString: SearchString) => {
    setSelectedString(searchString);
    setIsDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDialogOpen(false);
    setSelectedString(null);
  };

  const handleUpdateSearchString = async (id: string, generatedString: string) => {
    try {
      const success = await updateSearchString(id, generatedString);
      if (success) {
        if (selectedString && selectedString.id === id) {
          setSelectedString({
            ...selectedString,
            generated_string: generatedString,
            updated_at: new Date().toISOString()
          });
        }
        if (onError) onError(null);
      }
      return success;
    } catch (error) {
      console.error('Error updating search string:', error);
      if (onError) onError('Failed to update search string. Please try again.');
      return false;
    }
  };

  const handleDeleteSearchString = async (id: string) => {
    try {
      await deleteSearchString(id);
      if (onError) onError(null);
    } catch (error) {
      console.error('Error deleting search string:', error);
      if (onError) onError('Failed to delete search string. Please try again.');
    }
  };

  const handleCancelSearchString = async (id: string) => {
    try {
      setCancelingId(id);
      
      const response = await supabase.functions.invoke('website-crawler-cancel', {
        body: { jobId: id }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data?.success) {
        toast({
          title: "Processing cancelled",
          description: "The search string processing has been cancelled. You can now try again with a different URL or settings.",
        });
        
        await refetch();
      } else {
        throw new Error(response.data?.message || 'Failed to cancel processing');
      }
    } catch (error) {
      console.error('Error cancelling search string:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel the processing. Please try again.",
      });
      
      if (onError) onError('Failed to cancel search string processing. Please try again.');
    } finally {
      setCancelingId(null);
    }
  };

  return {
    selectedString,
    isDialogOpen,
    isRefreshing,
    cancelingId,
    handleManualRefresh,
    handleCopy,
    handleOpenDetail,
    handleCloseDetail,
    handleUpdateSearchString,
    handleDeleteSearchString,
    handleCancelSearchString,
  };
};
