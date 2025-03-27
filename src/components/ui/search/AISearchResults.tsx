
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AnimatedAgents } from '@/components/ui/animated-agents';

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
    <Card className="absolute z-50 top-full mt-1 w-full max-h-96 overflow-y-auto bg-white/90 backdrop-blur-sm shadow-lg rounded-md border border-primary/10">
      <div className="relative">
        {/* Animated background with agent icons */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <AnimatedAgents />
        </div>
        
        <div className="relative p-4 z-10">
          {isSearching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <span className="ml-2 text-primary font-medium">Processing your query...</span>
            </div>
          ) : (
            <>
              {error ? (
                <div className="text-red-500 py-2 font-medium">
                  <div>Error: {error}</div>
                  <div className="text-sm mt-2 text-red-400">
                    Please try rephrasing your question or try again later.
                  </div>
                </div>
              ) : aiResponse ? (
                <div className="prose prose-sm max-w-none">
                  <div className="font-semibold mb-2 text-primary">Answer:</div>
                  <div className="text-gray-700 whitespace-pre-line">{aiResponse}</div>
                </div>
              ) : (
                <div className="text-gray-500 py-2">
                  Type your question about the platform and press Enter
                  <div className="mt-2 text-xs text-gray-400">
                    Examples: "How do I create a project?", "Where can I find my files?", "How do I invite team members?"
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AISearchResults;
