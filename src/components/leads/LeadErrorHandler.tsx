
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadErrorHandlerProps {
  error: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryCount?: number;
}

const LeadErrorHandler = ({ error, onRetry, isRetrying = false, retryCount }: LeadErrorHandlerProps) => {
  if (!error) return null;
  
  // Simplify error message for better user experience
  const userMessage = error.message?.includes('policy') 
    ? "Datenbankrichtlinienfehler: Bitte versuchen Sie es später erneut."
    : error.message || "Ein unerwarteter Fehler ist aufgetreten.";
  
  return (
    <div className="my-4 p-4 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800 mb-2">Fehler beim Laden der Leads</h3>
          <p className="text-sm text-red-700 mb-3">{userMessage}</p>
          
          {retryCount > 0 && (
            <p className="text-xs text-red-600 mb-2">
              Wiederholungsversuche: {retryCount}
            </p>
          )}
          
          {onRetry && (
            <Button 
              onClick={onRetry}
              disabled={isRetrying}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Versuche erneut...' : 'Erneut versuchen'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadErrorHandler;
