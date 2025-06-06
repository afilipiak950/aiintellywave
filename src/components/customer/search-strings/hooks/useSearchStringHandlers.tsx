import { useState } from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { toast } from '@/hooks/use-toast';
import { useCancelSearchString } from '@/hooks/search-strings/operations/use-cancel-search-string';
import { useSearchStringManagement } from '@/hooks/search-strings/operations/use-search-string-management';
import { useWebsiteProcessor } from '@/hooks/search-strings/operations/use-website-processor';
import { useTextProcessor } from '@/hooks/search-strings/operations/use-text-processor';
import { usePdfProcessor } from '@/hooks/search-strings/operations/use-pdf-processor';

export interface SearchStringHandlersReturn {
  selectedString: SearchString | null;
  isDialogOpen: boolean;
  isRefreshing: boolean;
  cancelingId: string | null;
  handleManualRefresh: () => Promise<void>;
  handleOpenDetail: (searchString: SearchString) => void;
  handleCloseDetail: () => void;
  handleUpdateSearchString: (id: string, generatedString: string) => Promise<boolean>;
  handleDeleteSearchString: (id: string) => Promise<void>;
  handleCancelSearchString: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleCancel: (id: string) => Promise<void>;
  handleRetry: (searchString: SearchString) => Promise<void>;
  handleMarkAsProcessed: (searchString: SearchString) => Promise<void>;
  isDeleting: boolean;
  isCanceling: boolean;
  isRetrying: boolean;
  isMarkingAsProcessed: boolean;
}

export interface UseSearchStringHandlersProps {
  refetch?: () => Promise<void>;
  onError?: (error: string | null) => void;
}

export const useSearchStringHandlers = (props?: UseSearchStringHandlersProps): SearchStringHandlersReturn => {
  const [selectedString, setSelectedString] = useState<SearchString | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isMarkingAsProcessed, setIsMarkingAsProcessed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  
  const { deleteSearchString, markAsProcessed, updateSearchString } = useSearchStringManagement({ fetchSearchStrings: props?.refetch || (() => Promise.resolve()) });
  const { cancelSearchString } = useCancelSearchString();
  const { retryWebsiteSearchString } = useWebsiteProcessor();
  const { retryTextSearchString } = useTextProcessor();
  const { retryPdfSearchString } = usePdfProcessor();

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await props?.refetch?.();
    } catch (error) {
      console.error('Failed to refresh search strings:', error);
      props?.onError?.('Failed to refresh search strings');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenDetail = (searchString: SearchString) => {
    setSelectedString(searchString);
    setIsDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedString(null), 300);
  };

  const handleUpdateSearchString = async (id: string, generatedString: string) => {
    try {
      const result = await updateSearchString(id, generatedString);
      
      toast({
        title: "Search string updated",
        description: "The search string has been successfully updated.",
      });
      
      return result;
    } catch (error) {
      console.error('Failed to update search string:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the search string.",
        variant: "destructive",
      });
      return false;
    }
  };

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
      props?.onError?.('Failed to delete search string');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setIsCanceling(true);
      setCancelingId(id);
      await cancelSearchString(id);
      await props?.refetch?.(); // Refresh the list
      
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
      props?.onError?.('Failed to cancel search string processing');
    } finally {
      setIsCanceling(false);
      setCancelingId(null);
    }
  };

  const handleRetry = async (searchString: SearchString) => {
    try {
      setIsRetrying(true);
      
      let success = false;
      
      // Call the appropriate retry function based on the input source
      console.log(`Retrying search string with id: ${searchString.id}, source: ${searchString.input_source}`);
      
      if (searchString.input_source === 'website') {
        success = await retryWebsiteSearchString(searchString.id);
      } else if (searchString.input_source === 'text') {
        success = await retryTextSearchString(searchString.id);
      } else if (searchString.input_source === 'pdf') {
        success = await retryPdfSearchString(searchString.id);
      } else {
        throw new Error(`Unknown input source: ${searchString.input_source}`);
      }
      
      if (success) {
        toast({
          title: "Retry initiated",
          description: "The search string is being processed again.",
        });
        await props?.refetch?.(); // Refresh the list
      } else {
        throw new Error("Failed to retry search string processing");
      }
    } catch (error) {
      console.error('Failed to retry processing:', error);
      toast({
        title: "Retry failed",
        description: error instanceof Error ? error.message : "There was an error retrying the processing.",
        variant: "destructive",
      });
      props?.onError?.('Failed to retry search string processing');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleMarkAsProcessed = async (searchString: SearchString) => {
    try {
      setIsMarkingAsProcessed(true);
      // We need to pass null as the second argument since we're not in an admin context
      await markAsProcessed(searchString.id, null);
      
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
      props?.onError?.('Failed to mark search string as processed');
    } finally {
      setIsMarkingAsProcessed(false);
    }
  };

  // For backward compatibility
  const handleDeleteSearchString = handleDelete;
  const handleCancelSearchString = handleCancel;

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
    handleDelete,
    handleCancel,
    handleRetry,
    handleMarkAsProcessed,
    isDeleting,
    isCanceling,
    isRetrying,
    isMarkingAsProcessed,
  };
};
