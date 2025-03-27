
import { useState } from 'react';
import { authorizeGmail, authorizeOutlook, runGmailDiagnostic } from '@/services/email-integration-provider-service';
import { toast } from '@/hooks/use-toast';

export function useOAuthConnection() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [configErrorDialogOpen, setConfigErrorDialogOpen] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configErrorProvider, setConfigErrorProvider] = useState<string | null>(null);
  const [verificationErrorDialogOpen, setVerificationErrorDialogOpen] = useState(false);

  const handleOAuthConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      setIsLoading(true);
      setLoadingProvider(provider);
      let authUrl;
      
      console.log(`Initiating ${provider} OAuth flow`);
      
      if (provider === 'gmail') {
        // First, run a diagnostic to check connectivity
        try {
          const diagnostic = await runGmailDiagnostic();
          console.log('Gmail diagnostic results:', diagnostic);
          
          // Check for connectivity issues
          const googleConnectivity = diagnostic?.diagnostic?.connectivity?.['accounts.google.com'];
          if (googleConnectivity && !googleConnectivity.success) {
            throw new Error(`Unable to connect to Google authentication services: ${googleConnectivity.error}. This may be due to network restrictions or firewall settings.`);
          }
        } catch (diagError: any) {
          console.error('Diagnostic error:', diagError);
          // Continue anyway, the authorizeGmail will have its own error handling
        }
        
        // For Gmail, add useLocalWindow option to use a popup window instead of redirecting
        authUrl = await authorizeGmail({ useLocalWindow: true });
      } else {
        authUrl = await authorizeOutlook();
      }
      
      if (!authUrl) {
        throw new Error(`Failed to get authorization URL from ${provider} service`);
      }
      
      console.log(`Got ${provider} auth URL:`, authUrl);
      
      // If we're using Gmail with a popup window approach
      if (provider === 'gmail' && authUrl.includes('&display=popup')) {
        // Open popup window for authorization
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          authUrl,
          'Google Authorization',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Monitor popup and handle potential verification errors
        const checkPopupClosed = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkPopupClosed);
            setIsLoading(false);
            setLoadingProvider(null);
            
            // Check if the popup was blocked or closed without completing
            if (!popup) {
              toast({
                title: 'Popup Blocked',
                description: 'Please allow popups for this site and try again.',
                variant: 'destructive',
              });
            }
          }
        }, 1000);
        
        // Don't redirect, as we're using a popup
        return;
      }
      
      // The state parameter is now added directly in the edge function
      window.location.href = authUrl;
    } catch (error: any) {
      console.error(`Error connecting to ${provider}:`, error);
      
      // Check for specific error messages
      const errorMessage = error.message || '';
      
      // Check if it's a verification issue
      const isVerificationError = 
        errorMessage.includes('verification process') || 
        errorMessage.includes('Access blocked') || 
        errorMessage.includes('verification required');
      
      // Check if it's a network connectivity issue
      const isConnectivityError = 
        errorMessage.includes('declined') || 
        errorMessage.includes('rejected') || 
        errorMessage.includes('connect') ||
        errorMessage.includes('abgelehnt') ||
        errorMessage.includes('Unable to connect');
      
      // Check if it's likely a configuration issue
      const isConfigError = 
        errorMessage.includes('environment variable') || 
        errorMessage.includes('not set') || 
        errorMessage.includes('Missing') ||
        errorMessage.includes('Invalid response') ||
        errorMessage.includes('non-2xx status code');
      
      if (isVerificationError) {
        setVerificationErrorDialogOpen(true);
      } else if (isConnectivityError || isConfigError) {
        setConfigErrorProvider(provider);
        setConfigError(errorMessage);
        setConfigErrorDialogOpen(true);
      } else {
        toast({
          title: 'Connection Error',
          description: `Failed to connect to ${provider}: ${errorMessage}`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return {
    isLoading,
    loadingProvider,
    configErrorDialogOpen,
    setConfigErrorDialogOpen,
    configError,
    configErrorProvider,
    verificationErrorDialogOpen,
    setVerificationErrorDialogOpen,
    handleOAuthConnect,
  };
}
