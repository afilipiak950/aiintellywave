
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
      ) : (
        searchString.generated_string || 'No results yet'
      )}
    </div>
  );
};

export default SearchStringDisplay;
