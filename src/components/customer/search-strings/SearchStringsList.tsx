
import React, { useState } from 'react';
import { useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import SearchStringItem from './SearchStringItem';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import SearchStringsLoading from './SearchStringsLoading';
import SearchStringDetailDialog from './SearchStringDetailDialog';
import { useSearchStringHandlers } from './hooks/useSearchStringHandlers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchStringsListProps {
  onError?: (error: string | null) => void;
}

const SearchStringsList: React.FC<SearchStringsListProps> = ({ onError }) => {
  const { searchStrings, isLoading, refetch } = useSearchStrings();
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { 
    selectedString, 
    isDialogOpen, 
    handleOpenDetail, 
    handleCloseDetail,
    handleUpdateSearchString,
    handleDelete,
    handleCancel,
    handleRetry,
    cancelingId,
  } = useSearchStringHandlers({ 
    refetch, 
    onError 
  });

  // Handler for manual refresh attempts
  const handleManualRefresh = async () => {
    setIsRetrying(true);
    try {
      await refetch();
      setRetryAttempt(prev => prev + 1);
    } catch (error) {
      console.error('Error refreshing search strings:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Check for the specific infinite recursion error
  const hasInfiniteRecursionError = searchStrings.length === 0 && 
    onError && 
    typeof onError === 'function' && 
    window.localStorage.getItem('searchStrings_error')?.includes('infinite recursion');

  if (isLoading) {
    return <SearchStringsLoading />;
  }

  // Show a specific error message for the infinite recursion error
  if (hasInfiniteRecursionError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Datenbankrichtlinienfehler</AlertTitle>
        <AlertDescription className="flex flex-col">
          <span>Bei der Datenbankabfrage ist ein Fehler aufgetreten: Infinite recursion detected in policy for relation "user_roles"</span>
          <div className="mt-4">
            <p className="mb-2">Zur Behebung dieses Problems:</p>
            <ol className="list-decimal pl-4 mb-4 space-y-1">
              <li>Melden Sie sich vom System ab</li>
              <li>Melden Sie sich wieder an</li>
              <li>Wenn das Problem weiterhin besteht, löschen Sie den Browser-Cache</li>
            </ol>
            <Button 
              onClick={handleManualRefresh} 
              className="text-white bg-destructive/90 hover:bg-destructive px-3 py-1 mt-2 rounded text-sm self-start flex items-center gap-1"
              disabled={isRetrying}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} /> 
              {isRetrying ? 'Verbindung wird wiederhergestellt...' : 'Verbindung wiederherstellen'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (searchStrings.length === 0) {
    return <SearchStringsEmptyState />;
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Your Search Strings</h2>
      
      <div>
        {searchStrings.map((searchString) => (
          <SearchStringItem 
            key={searchString.id} 
            searchString={searchString} 
            onOpenDetail={handleOpenDetail}
            onDelete={handleDelete}
            onCancel={handleCancel}
            onRetry={handleRetry}
            cancelingId={cancelingId}
          />
        ))}
      </div>
      
      {selectedString && (
        <SearchStringDetailDialog
          searchString={selectedString}
          open={isDialogOpen}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateSearchString}
        />
      )}
    </div>
  );
};

export default SearchStringsList;
