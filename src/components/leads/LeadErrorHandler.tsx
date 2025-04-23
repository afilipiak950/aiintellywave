
import { AlertCircle, RefreshCw, Database, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadErrorHandlerProps {
  error: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryCount?: number;
}

const LeadErrorHandler = ({ error, onRetry, isRetrying = false, retryCount = 0 }: LeadErrorHandlerProps) => {
  if (!error) return null;
  
  // Detect specific error types for better messaging
  const isRlsError = error.message?.includes('policy') || 
                     error.message?.includes('infinite recursion') ||
                     error.message?.includes('violates row-level security');
  
  const isNetworkError = error.message?.includes('network') ||
                         error.message?.includes('Failed to fetch');
  
  return (
    <div className="my-4 p-4 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800 mb-2">Fehler beim Laden der Leads</h3>
          <p className="text-sm text-red-700 mb-3">
            {isRlsError 
              ? "Datenbankberechtigungsfehler: Das System versucht, alternative Zugriffsmethoden zu verwenden."
              : isNetworkError
              ? "Netzwerkverbindungsproblem: Bitte überprüfen Sie Ihre Internetverbindung."
              : error.message || "Ein unerwarteter Fehler ist aufgetreten."}
          </p>
          
          {isRlsError && (
            <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700 flex items-start">
              <Shield className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Datenbank-Zugriffsschutz aktiv</p>
                <p className="mt-1">Das System verwendet Fallback-Methoden, um Ihre Daten zu laden. Dies kann zu längeren Ladezeiten führen.</p>
              </div>
            </div>
          )}
          
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
              className="border-red-300 text-red-700 hover:bg-red-100 flex items-center"
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
