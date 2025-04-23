
import { useState } from 'react';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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
  
  // Simplified error message detection
  const isPermissionError = error.message.includes('permission') || 
                          error.message.includes('infinite recursion');
  
  const isNetworkError = error.message.includes('Failed to fetch') || 
                        error.message.includes('network');
  
  // Get user-friendly error message
  const getUserMessage = () => {
    if (isPermissionError) {
      return "Berechtigungsfehler beim Zugriff auf die Datenbank. Es könnte ein Problem mit Ihren Zugriffsrechten geben.";
    }
    
    if (isNetworkError) {
      return "Netzwerkfehler beim Laden der Leads. Bitte überprüfen Sie Ihre Internetverbindung.";
    }
    
    if (retryCount > 3) {
      return "Es gab mehrere fehlgeschlagene Versuche, die Leads zu laden. Bitte wenden Sie sich an den Support.";
    }
    
    return error.message;
  };
  
  const userMessage = getUserMessage();
  
  const handleRetry = () => {
    if (onRetry && !isRetrying) {
      onRetry();
      toast({
        title: "Versuche erneut",
        description: "Die Leads werden neu geladen..."
      });
    }
  };
  
  return (
    <div className="my-4 p-4 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800 mb-2">Fehler beim Laden der Leads</h3>
          
          <div className="space-y-3">
            <p className="text-sm text-red-700">
              {userMessage}
            </p>
            
            {isPermissionError && (
              <div className="text-xs bg-yellow-50 border border-yellow-200 p-2 rounded text-yellow-800">
                <div className="flex items-center mb-1">
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                  <span className="font-medium">Datenbank-Berechtigungsproblem</span>
                </div>
                <p>
                  Möglicherweise gibt es ein Problem mit Ihrer Benutzerrolle oder den Berechtigungseinstellungen.
                  Das System versucht, Ihre Daten mit alternativen Methoden zu laden.
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3 mt-2">
              {onRetry && (
                <Button 
                  onClick={handleRetry}
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
          </div>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-white rounded border border-red-200">
              <p className="text-xs text-red-800 font-mono whitespace-pre-wrap">
                {error.message}
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
