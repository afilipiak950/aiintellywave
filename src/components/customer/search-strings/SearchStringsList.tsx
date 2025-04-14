
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import SearchStringDetailDialog from './SearchStringDetailDialog';
import { useSearchStringHandlers } from './hooks/useSearchStringHandlers';
import SearchStringsHeader from './SearchStringsHeader';
import SearchStringsLoading from './SearchStringsLoading';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import SearchStringItem from './SearchStringItem';

interface SearchStringsListProps {
  onError?: (error: string | null) => void;
}

const SearchStringsList: React.FC<SearchStringsListProps> = ({ onError }) => {
  // We're accessing the search string data and functions from our hook
  const { searchStrings, isLoading, refetch } = useSearchStrings();
  
  // Getting the handler functions from our custom hook
  // The issue is here - we need to make sure the type definitions match
  const {
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
  } = useSearchStringHandlers({
    refetch,
    // We'll handle these mismatches by properly handling the return values
    onError
  });

  if (isLoading) {
    return (
      <Card>
        <SearchStringsHeader onRefresh={handleManualRefresh} isRefreshing={isRefreshing} />
        <CardContent>
          <SearchStringsLoading />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <SearchStringsHeader onRefresh={handleManualRefresh} isRefreshing={isRefreshing} />
      <CardContent>
        {searchStrings && searchStrings.length > 0 ? (
          <div className="space-y-4">
            {searchStrings.map((searchString) => (
              <SearchStringItem
                key={searchString.id}
                searchString={searchString}
                onOpenDetail={handleOpenDetail}
                onDeleteSearchString={handleDeleteSearchString}
                onCancelSearchString={handleCancelSearchString}
                cancelingId={cancelingId}
              />
            ))}
          </div>
        ) : (
          <SearchStringsEmptyState />
        )}
        
        {selectedString && (
          <SearchStringDetailDialog 
            searchString={selectedString}
            open={isDialogOpen}
            onClose={handleCloseDetail}
            onUpdate={handleUpdateSearchString}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SearchStringsList;
