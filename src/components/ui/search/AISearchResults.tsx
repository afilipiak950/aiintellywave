
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AISearchResultsProps {
  isSearching: boolean;
  error: string;
  aiResponse: string;
}

const AISearchResults: React.FC<AISearchResultsProps> = ({
  isSearching,
  error,
  aiResponse
}) => {
  return (
    <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border">
      <div className="p-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-600">Searching...</span>
          </div>
        ) : (
          <>
            {error ? (
              <div className="text-red-500 py-2">{error}</div>
            ) : aiResponse ? (
              <div className="prose prose-sm max-w-none">
                <div className="font-semibold mb-2">Answer:</div>
                <div className="text-gray-700 whitespace-pre-line">{aiResponse}</div>
              </div>
            ) : (
              <div className="text-gray-500 py-2">Type your question and press Enter</div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default AISearchResults;
