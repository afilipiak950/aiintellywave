
import React from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import ProcessingIndicator from './ProcessingIndicator';
import { EyeOff } from 'lucide-react';

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
  // Function to format error message for display
  const formatErrorMessage = (error: string) => {
    if (error.includes('Edge Function error')) {
      return 'Server processing error. Please try again with longer content.';
    }
    if (error.includes('Insufficient content')) {
      return 'The provided text is too short. Please provide more content for better results.';
    }
    if (error.includes('non-2xx status code')) {
      return 'Unable to connect to server. Please try again later or contact support.';
    }
    if (error.includes('No PDF file found')) {
      return 'Cannot retry: The PDF file for this search string is no longer available. Please create a new search string with your PDF.';
    }
    return error;
  };

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
        <div>
          <span className="text-amber-500">Completed, but no search string was generated. Please try again with more content.</span>
        </div>
      ) : searchString.status === 'failed' ? (
        <div>
          <div className="text-red-500">
            <span className="font-bold">Error:</span> {searchString.error ? formatErrorMessage(searchString.error) : "Unknown error. Please try again."}
          </div>
          <div className="mt-2 text-gray-600">
            {!searchString.error?.includes('No PDF file found') && 
              "You can use the \"Retry\" button below to try processing this search string again with more content."}
            {searchString.error?.includes('No PDF file found') && 
              "Please create a new search string by uploading your PDF file again."}
          </div>
        </div>
      ) : searchString.status === 'canceled' ? (
        <div>
          <span className="text-amber-500">Search string generation was canceled.</span>
        </div>
      ) : (
        <div>
          <span className="text-gray-400">No results yet</span>
        </div>
      )}
    </div>
  );
};

export default SearchStringDisplay;
