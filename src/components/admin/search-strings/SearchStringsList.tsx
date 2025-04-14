
import React, { useEffect, useState } from 'react';
import { useSearchStringState } from './hooks/state/useSearchStringState';
import SearchStringRow from './SearchStringRow';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import SearchStringsLoading from './SearchStringsLoading';

// Define the ConnectionStatusType as an enum
enum ConnectionStatusType {
  CHECKING = "checking",
  CONNECTED = "connected",
  ERROR = "error"
}

export const SearchStringsList = () => {
  const { state, setters } = useSearchStringState();
  const { 
    searchStrings, 
    isLoading, 
    error 
  } = state;
  
  const { 
    setSearchStrings,
    setIsLoading,
    setError
  } = setters;
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>(ConnectionStatusType.CONNECTED);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const maxRetries = 3;
  
  // Mock fetchSearchStrings function since it's not in the useSearchStringState hook
  const fetchSearchStrings = async () => {
    try {
      setIsLoading(true);
      // Fetch logic would go here in a real implementation
      // For now we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update total count after fetch
      setTotal(searchStrings.length);
      setHasMore(page < totalPages);
      
      setIsLoading(false);
      setConnectionStatus(ConnectionStatusType.CONNECTED);
    } catch (error) {
      console.error('Error fetching search strings:', error);
      setConnectionStatus(ConnectionStatusType.ERROR);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unknown error occurred');
      }
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (connectionStatus === ConnectionStatusType.ERROR && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setConnectionStatus(ConnectionStatusType.CHECKING);
        fetchSearchStrings();
        setRetryCount(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    if (connectionStatus === ConnectionStatusType.ERROR && retryCount >= maxRetries) {
      setShowRetryButton(true);
    }
  }, [connectionStatus, retryCount]);
  
  const handleManualRetry = () => {
    setRetryCount(0);
    setShowRetryButton(false);
    setConnectionStatus(ConnectionStatusType.CHECKING);
    fetchSearchStrings();
  };
  
  const handleLoadMore = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };
  
  useEffect(() => {
    // Initial fetch
    fetchSearchStrings();
    
    // Set up mock total pages
    setTotalPages(Math.ceil(searchStrings.length / 10));
    setTotal(searchStrings.length);
    setHasMore(page < totalPages);
  }, [page]);
  
  if (isLoading && searchStrings.length === 0) {
    return <SearchStringsLoading />;
  }
  
  if (error && searchStrings.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load search strings</h3>
          <p className="text-muted-foreground mb-4">
            There was an error connecting to the server. Please try again later.
          </p>
          {showRetryButton && (
            <Button 
              onClick={handleManualRetry} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  if (searchStrings.length === 0) {
    return <SearchStringsEmptyState searchTerm="" hasStrings={false} onReset={() => {}} onRefresh={fetchSearchStrings} />;
  }
  
  return (
    <>
      <div className="grid gap-4">
        {searchStrings.map((searchString) => (
          <SearchStringRow 
            key={searchString.id} 
            item={searchString}
            companyName="N/A"
            userEmail="N/A"
            onViewDetails={() => {}}
            onMarkAsProcessed={async () => {}}
            onCreateProject={() => {}}
          />
        ))}
      </div>
      
      {connectionStatus === ConnectionStatusType.CHECKING && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
          <p className="text-sm text-muted-foreground">Checking for more items...</p>
        </div>
      )}
      
      {connectionStatus === ConnectionStatusType.ERROR && (
        <div className="flex flex-col items-center py-4 gap-2">
          <p className="text-sm text-muted-foreground">
            Connection issue. Failed to check for more items.
          </p>
          <Button 
            onClick={handleManualRetry} 
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      )}
      
      {hasMore && connectionStatus !== ConnectionStatusType.CHECKING && connectionStatus !== ConnectionStatusType.ERROR && (
        <div className="flex justify-center py-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="flex items-center gap-2"
          >
            Load More
          </Button>
        </div>
      )}
      
      {!hasMore && searchStrings.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {total > 0 ? (
            <p>Showing all {total} results</p>
          ) : (
            <p>End of results</p>
          )}
        </div>
      )}
    </>
  );
};

export default SearchStringsList;
