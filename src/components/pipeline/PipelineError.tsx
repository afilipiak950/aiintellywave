
import React from 'react';
import { toast } from '@/hooks/use-toast';

interface PipelineErrorProps {
  error: string;
  onRetry: () => void;
  isRefreshing: boolean;
}

const PipelineError: React.FC<PipelineErrorProps> = ({ error }) => {
  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error]);

  return null;
};

export default PipelineError;
