
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PipelineErrorProps {
  error: string;
  onRetry: () => void;
  isRefreshing: boolean;
}

const PipelineError: React.FC<PipelineErrorProps> = ({ error, onRetry, isRefreshing }) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-fit" 
          onClick={onRetry}
          disabled={isRefreshing}
        >
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default PipelineError;
