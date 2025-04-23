
import { useState } from 'react';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLeadErrorMessage } from './lead-error-utils';

interface LeadErrorHandlerProps {
  error: Error | null;
  retryCount?: number;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const LeadErrorHandler = ({ 
  error, 
  retryCount = 0, 
  onRetry, 
  isRetrying = false 
}: LeadErrorHandlerProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!error) return null;
  
  const getRetryMessage = () => {
    if (retryCount <= 1) return "";
    if (retryCount <= 3) return "Wir haben es bereits mehrmals versucht, aber es gibt weiterhin Probleme.";
    return "Mehrere Versuche sind fehlgeschlagen. Dies könnte ein Berechtigungsproblem sein.";
  };

  const userMessage = getLeadErrorMessage(error);
  const detailedMessage = error.message;
  const retryMessage = getRetryMessage();
  
  return (
    <div className="my-4 p-4 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800 mb-1">Fehler beim Laden der Leads</h3>
          <p className="text-sm text-red-700 mb-2">
            {userMessage}
          </p>
          {retryMessage && (
            <p className="text-sm text-red-600 italic mb-3">
              {retryMessage}
            </p>
          )}
          
          <div className="flex flex-wrap gap-3">
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-red-600"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5 mr-1" />
                  Details ausblenden
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 mr-1" />
                  Details anzeigen
                </>
              )}
            </Button>
          </div>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-white rounded border border-red-200">
              <p className="text-xs text-red-800 font-mono whitespace-pre-wrap">
                {detailedMessage}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-700 cursor-pointer">Stack Trace</summary>
                  <pre className="mt-1 p-2 text-xs bg-red-50 rounded overflow-x-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadErrorHandler;
