
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { InteractiveAIBackground } from '@/components/ui/interactive-ai-background';
import { Button } from '@/components/ui/button';

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
      <InteractiveAIBackground density="low" speed="slow">
        <div className="p-4">
          {isSearching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <span className="ml-2 text-primary font-medium">Processing your query...</span>
            </div>
          ) : (
            <>
              {error ? (
                <div className="text-red-500 py-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Error: {error}</div>
                      <div className="text-sm mt-2 text-red-400">
                        Please try rephrasing your question or try again later.
                      </div>
                    </div>
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
      </InteractiveAIBackground>
    </Card>
  );
};

export default AISearchResults;
