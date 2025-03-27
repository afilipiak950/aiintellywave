
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { runGmailDiagnostic } from '@/services/email-integration-provider-service';

interface ConfigErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configError: string | null;
  configErrorProvider: string | null;
}

export function ConfigErrorDialog({
  open,
  onOpenChange,
  configError,
  configErrorProvider,
}: ConfigErrorDialogProps) {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  
  const runDiagnostic = async () => {
    try {
      setIsRunningDiagnostic(true);
      const results = await runGmailDiagnostic();
      setDiagnosticResults(results?.diagnostic || null);
    } catch (error) {
      console.error('Failed to run diagnostic:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };
  
  const isNetworkError = configError && (
    configError.includes('declined') || 
    configError.includes('rejected') || 
    configError.includes('connect') ||
    configError.includes('abgelehnt')
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isNetworkError ? (
              <><WifiOff className="h-5 w-5 text-destructive" /> Network Connectivity Issue</>
            ) : (
              <><AlertCircle className="h-5 w-5 text-destructive" /> Configuration Error</>
            )}
          </DialogTitle>
          <DialogDescription>
            {isNetworkError ? 
              'There appears to be a network issue when connecting to Google services' : 
              `There was an issue with the ${configErrorProvider} integration configuration`}
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{isNetworkError ? 'Connection Failed' : 'Configuration Error'}</AlertTitle>
          <AlertDescription>{configError}</AlertDescription>
        </Alert>

        {isNetworkError && (
          <div className="space-y-4 mt-4">
            <div className="bg-muted p-3 rounded-md text-sm">
              <h3 className="font-semibold mb-1">Possible Solutions:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Check if you're using a VPN, proxy, or firewall that might be blocking connections to Google services</li>
                <li>Try using a different internet connection</li>
                <li>Ensure your browser doesn't have any extensions blocking Google services</li>
                <li>Try accessing accounts.google.com directly in your browser to see if it works</li>
              </ul>
            </div>
            
            <Button
              variant="secondary"
              className="w-full"
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
            >
              {isRunningDiagnostic ? (
                <>
                  <span className="animate-spin mr-2">◌</span> Running Network Diagnostic...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" /> Run Advanced Network Diagnostic
                </>
              )}
            </Button>
            
            {diagnosticResults && (
              <div className="text-xs">
                <h3 className="font-semibold mb-1">Diagnostic Results:</h3>
                <div className="bg-muted p-2 rounded-md">
                  <h4 className="font-medium">Google Service Connectivity:</h4>
                  <ul className="list-disc list-inside pl-2">
                    {Object.entries(diagnosticResults.connectivity || {}).map(([domain, info]: [string, any]) => {
                      const isGoogleDomain = domain.includes('google');
                      if (!isGoogleDomain) return null;
                      
                      return (
                        <li key={domain} className="text-xs">
                          {domain}: {info.success ? '✅ Connected' : `❌ Failed: ${info.error || 'Connection error'}`}
                        </li>
                      );
                    })}
                  </ul>
                  
                  <div className="pt-2 mt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      If Google services are not reachable, this may indicate network restrictions. 
                      Try a different network or disable any VPN/proxy services.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
