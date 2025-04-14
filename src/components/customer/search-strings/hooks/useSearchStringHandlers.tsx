import { useState } from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { useToast } from '@/hooks/use-toast';
import { useCancelSearchString } from '@/hooks/search-strings/operations/use-cancel-search-string';
import { useSearchStringManagement } from '@/hooks/search-strings/operations/use-search-string-management';

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
  handleMarkAsProcessed: (searchString: SearchString) => Promise<void>;
  isDeleting: boolean;
  isCanceling: boolean;
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
  const [isMarkingAsProcessed, setIsMarkingAsProcessed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  
  const { deleteSearchString, markAsProcessed, updateSearchString, refetch } = useSearchStringManagement();
  const { cancelSearchString } = useCancelSearchString();
  const { toast } = useToast();

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch?.();
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
      await refetch?.(); // Refresh the list
      
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
    handleMarkAsProcessed,
    isDeleting,
    isCanceling,
    isMarkingAsProcessed,
  };
};
