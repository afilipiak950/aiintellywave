
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface PipelineErrorProps {
  error: string;
  onRetry: () => void;
  isRefreshing: boolean;
}

const PipelineError: React.FC<PipelineErrorProps> = ({ error, onRetry, isRefreshing }) => {
  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error]);

  // Now we'll also display an error alert for better visibility
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Pipeline Error</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>{error}</p>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRetry}
          disabled={isRefreshing}
          className="mt-2"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default PipelineError;
