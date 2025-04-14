
import React from 'react';
import { useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import SearchStringItem from './SearchStringItem';
import SearchStringsEmptyState from './SearchStringsEmptyState';
import SearchStringsLoading from './SearchStringsLoading';
import SearchStringDetailDialog from './SearchStringDetailDialog';
import { useSearchStringHandlers } from './hooks/useSearchStringHandlers';

interface SearchStringsListProps {
  onError?: (error: string | null) => void;
}

const SearchStringsList: React.FC<SearchStringsListProps> = ({ onError }) => {
  const { searchStrings, isLoading, refetch } = useSearchStrings();
  
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

  if (isLoading) {
    return <SearchStringsLoading />;
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
