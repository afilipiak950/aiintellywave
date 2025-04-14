
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
          progress={searchString.progress || 0} 
          onCancel={() => onCancelSearchString(searchString.id)}
          isCanceling={cancelingId === searchString.id}
        />
      ) : searchString.status === 'completed' && searchString.generated_string ? (
        <div className="space-y-2">
          <div className="font-bold text-gray-700 mb-1">Generated Search String:</div>
          <div className="bg-white p-2 border border-gray-200 rounded-sm">
            {searchString.generated_string}
          </div>
          {searchString.input_url && (
            <div className="text-xs text-gray-500 mt-2">
              Source: <a href={searchString.input_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{searchString.input_url}</a>
            </div>
          )}
        </div>
      ) : searchString.status === 'completed' && !searchString.generated_string ? (
        <span className="text-amber-500">Completed, but no search string was generated. Please try again.</span>
      ) : searchString.status === 'failed' ? (
        <span className="text-red-500">Error generating search string: {searchString.error || "Unknown error. Please try again."}</span>
      ) : searchString.status === 'canceled' ? (
        <span className="text-amber-500">Search string generation was canceled.</span>
      ) : (
        <span className="text-gray-400">No results yet</span>
      )}
    </div>
  );
};

export default SearchStringDisplay;
