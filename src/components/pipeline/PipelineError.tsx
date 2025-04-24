
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">Fehler beim Laden der Daten</h3>
          <p className="text-red-700 mb-4">{error}</p>
          
          <Button 
            onClick={onRetry} 
            disabled={isRefreshing}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Wird geladen...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Erneut versuchen
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PipelineError;
