
import React from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import ProcessingIndicator from './ProcessingIndicator';

interface SearchStringDisplayProps {
  searchString: SearchString;
  onCancelSearchString: (id: string) => Promise<void>;
  cancelingId: string | null;
}

const SearchStringDisplay: React.FC<SearchStringDisplayProps> = ({ 
  searchString, 
  onCancelSearchString, 
  cancelingId 
}) => {
  return (
    <div className="p-3 bg-gray-50 border rounded-md font-mono text-xs mb-3 overflow-x-auto">
      {searchString.status === 'processing' ? (
        <ProcessingIndicator 
          progress={searchString.progress} 
          onCancel={() => onCancelSearchString(searchString.id)}
          isCanceling={cancelingId === searchString.id}
        />
      ) : searchString.status === 'completed' && searchString.generated_string ? (
        searchString.generated_string
      ) : searchString.status === 'failed' ? (
        <span className="text-red-500">Error generating search string. Please try again.</span>
      ) : searchString.status === 'canceled' ? (
        <span className="text-amber-500">Search string generation was canceled.</span>
      ) : (
        <span className="text-gray-400">No results yet</span>
      )}
    </div>
  );
};

export default SearchStringDisplay;
