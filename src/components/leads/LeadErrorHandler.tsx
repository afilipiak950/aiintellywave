
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
        // If repair was successful, try fetching data again
        setTimeout(() => {
          onRetry();
        }, 1500);
      }
    } catch (e) {
      setRepairStatus({
        success: false,
        message: "Error during repair attempt"
      });
    } finally {
      setIsRepairing(false);
    }
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
          
          {isNoProjectsError && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded text-blue-800">
              <p className="flex items-center gap-1 font-medium mb-1">
                <InfoIcon className="h-4 w-4" />
                Missing Project Association
              </p>
              <p className="text-sm">
                You need to create a project or fix the association between your user account and company.
                Try clicking the "Repair Connection" button below.
              </p>
            </div>
          )}
          
          {retryCount > 0 && (
            <p className="text-sm text-gray-600">
              Automatic retry attempts: {retryCount}
            </p>
          )}
          
          {repairStatus && (
            <div className={`p-3 rounded border ${repairStatus.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <p className="font-medium mb-1">
                {repairStatus.success ? 'Repair Successful' : 'Repair Failed'}
              </p>
              <p className="text-sm">{repairStatus.message}</p>
              {repairStatus.company && (
                <p className="text-sm mt-1">
                  Associated with: {repairStatus.company.name}
                </p>
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
              {isRetrying ? 'Retrying...' : 'Retry Now'}
            </Button>
            
            {isNoProjectsError && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRepairAttempt}
                disabled={isRepairing}
                className="flex items-center gap-1"
              >
                <Wrench className={`h-4 w-4 ${isRepairing ? 'animate-spin' : ''}`} />
                {isRepairing ? 'Repairing...' : 'Repair Connection'}
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
