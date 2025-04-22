
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { getLeadErrorMessage, getDiagnosticInfo } from './lead-error-utils';

interface LeadErrorHandlerProps {
  error: Error | null;
  retryCount: number;
  onRetry: () => void;
  isRetrying: boolean;
  showDetails?: boolean;
}

const LeadErrorHandler: React.FC<LeadErrorHandlerProps> = ({
  error,
  retryCount,
  onRetry,
  isRetrying,
  showDetails = false
}) => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [showingDiagnostics, setShowingDiagnostics] = useState(false);
  
  const errorMessage = getLeadErrorMessage(error);
  const isRlsError = error?.message.toLowerCase().includes('infinite recursion') || 
                     error?.message.toLowerCase().includes('policy');
  
  const handleShowDiagnostics = async () => {
    setShowingDiagnostics(true);
    const info = await getDiagnosticInfo();
    setDiagnosticInfo(info);
  };
  
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        Lead Database Error
      </AlertTitle>
      
      <AlertDescription>
        <div className="pt-2 space-y-3">
          <p className="font-medium">{errorMessage}</p>
          
          {isRlsError && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800">
              <p className="flex items-center gap-1 font-medium mb-1">
                <ShieldAlert className="h-4 w-4" />
                Database Security Issue
              </p>
              <p className="text-sm">
                This is due to a security policy configuration issue. The system is attempting 
                to use alternate methods to load your leads.
              </p>
            </div>
          )}
          
          {retryCount > 0 && (
            <p className="text-sm text-gray-600">
              Automatic retry attempts: {retryCount}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              disabled={isRetrying}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} /> 
              {isRetrying ? 'Retrying...' : 'Retry Now'}
            </Button>
            
            {!showingDiagnostics && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowDiagnostics}
                className="text-gray-500"
              >
                <InfoIcon className="h-4 w-4 mr-1" />
                Diagnostics
              </Button>
            )}
          </div>
          
          {showingDiagnostics && diagnosticInfo && (
            <div className="mt-3 bg-slate-50 p-3 rounded text-xs font-mono border border-slate-200 overflow-x-auto">
              <pre>{JSON.stringify(diagnosticInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default LeadErrorHandler;
