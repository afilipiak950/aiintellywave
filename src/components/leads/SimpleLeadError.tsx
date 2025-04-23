
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface SimpleLeadErrorProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const SimpleLeadError: React.FC<SimpleLeadErrorProps> = ({ 
  message, 
  onRetry, 
  isRetrying = false 
}) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Fehler beim Laden der Leads</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">{message}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            disabled={isRetrying}
            className="mt-2"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Versuche erneut...' : 'Erneut versuchen'}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SimpleLeadError;
