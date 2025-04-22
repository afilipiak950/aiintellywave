
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, RefreshCw, AlertCircle, ShieldAlert, Wrench } from 'lucide-react';
import { getLeadErrorMessage, getDiagnosticInfo, attemptCompanyRepair } from './lead-error-utils';

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
  const [repairStatus, setRepairStatus] = useState<{success?: boolean; message?: string; company?: any} | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  
  const errorMessage = getLeadErrorMessage(error);
  const isRlsError = error?.message.toLowerCase().includes('infinite recursion') || 
                     error?.message.toLowerCase().includes('policy');
  const isNoProjectsError = error?.message.toLowerCase().includes('no projects found') ||
                           error?.message.toLowerCase().includes('project') && error?.message.toLowerCase().includes('not found');
  
  const handleShowDiagnostics = async () => {
    setShowingDiagnostics(true);
    const info = await getDiagnosticInfo();
    setDiagnosticInfo(info);
  };
  
  const handleRepairAttempt = async () => {
    setIsRepairing(true);
    try {
      const result = await attemptCompanyRepair();
      setRepairStatus(result);
      
      if (result.success) {
        // If repair was successful, try fetching data again after a short delay
        // But DON'T auto-retry - wait for user action instead
        setIsRepairing(false);
      }
    } catch (e) {
      setRepairStatus({
        success: false,
        message: "Fehler beim Reparaturversuch"
      });
    } finally {
      setIsRepairing(false);
    }
  };
  
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        Lead Datenbank Fehler
      </AlertTitle>
      
      <AlertDescription>
        <div className="pt-2 space-y-3">
          <p className="font-medium">{errorMessage}</p>
          
          {isRlsError && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800">
              <p className="flex items-center gap-1 font-medium mb-1">
                <ShieldAlert className="h-4 w-4" />
                Datenbank-Sicherheitsproblem
              </p>
              <p className="text-sm">
                Dies ist auf ein Problem mit der Sicherheitsrichtlinienkonfiguration zurückzuführen. 
                Bitte klicken Sie auf "Verbindung reparieren", um das Problem zu beheben.
              </p>
            </div>
          )}
          
          {isNoProjectsError && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded text-blue-800">
              <p className="flex items-center gap-1 font-medium mb-1">
                <InfoIcon className="h-4 w-4" />
                Fehlende Projektzuordnung
              </p>
              <p className="text-sm">
                Sie müssen ein Projekt erstellen oder die Zuordnung zwischen Ihrem Benutzerkonto und Ihrem Unternehmen korrigieren.
                Versuchen Sie, unten auf die Schaltfläche "Verbindung reparieren" zu klicken.
              </p>
            </div>
          )}
          
          {repairStatus && (
            <div className={`p-3 rounded border ${repairStatus.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <p className="font-medium mb-1">
                {repairStatus.success ? 'Reparatur erfolgreich' : 'Reparatur fehlgeschlagen'}
              </p>
              <p className="text-sm">{repairStatus.message}</p>
              {repairStatus.company && (
                <p className="text-sm mt-1">
                  Verbunden mit: {repairStatus.company.name}
                </p>
              )}
              {repairStatus.success && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    onClick={onRetry}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Seite neu laden
                  </Button>
                </div>
              )}
            </div>
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
              {isRetrying ? 'Wird geladen...' : 'Neu laden'}
            </Button>
            
            {/* Only show repair button if there's a project or RLS error */}
            {(isNoProjectsError || isRlsError) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRepairAttempt}
                disabled={isRepairing}
                className="flex items-center gap-1"
              >
                <Wrench className={`h-4 w-4 ${isRepairing ? 'animate-spin' : ''}`} />
                {isRepairing ? 'Reparieren...' : 'Verbindung reparieren'}
              </Button>
            )}
            
            {!showingDiagnostics && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowDiagnostics}
                className="text-gray-500"
              >
                <InfoIcon className="h-4 w-4 mr-1" />
                Diagnose
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
