
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StopCircle } from 'lucide-react';

interface ProcessingIndicatorProps {
  progress: number | null | undefined;
  onCancel: () => void;
  isCanceling: boolean;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ 
  progress, 
  onCancel, 
  isCanceling 
}) => {
  // Convert progress to a number or default to 0
  const progressValue = typeof progress === 'number' ? progress : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>Processing... {typeof progress === 'number' ? `(${Math.round(progress)}%)` : ''}</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancel}
          className="text-xs ml-auto text-amber-600 hover:text-amber-700"
          disabled={isCanceling}
        >
          {isCanceling ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
              Cancelling...
            </>
          ) : (
            <>
              <StopCircle className="h-3 w-3 mr-1" />
              Cancel & Retry
            </>
          )}
        </Button>
      </div>
      
      <Progress 
        value={progressValue} 
        className="h-2 w-full"
        indicatorClassName={progressValue > 0 ? "bg-blue-500" : "bg-gray-300"}
      />
      
      <div className="text-xs text-gray-500 mt-1">
        {progressValue === 0 ? (
          "Starting processing..."
        ) : progressValue < 25 ? (
          "Crawling website..."
        ) : progressValue < 50 ? (
          "Extracting content..."
        ) : progressValue < 75 ? (
          "Analyzing content..."
        ) : (
          "Generating search string..."
        )}
      </div>
    </div>
  );
};

export default ProcessingIndicator;
