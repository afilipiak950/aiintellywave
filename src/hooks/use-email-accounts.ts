
import { useState, useTransition } from 'react';
import { usePersonas } from '@/hooks/use-personas';
import { EmailIntegration } from '@/types/persona';
import { authorizeGmail, authorizeOutlook, runGmailDiagnostic } from '@/services/email-integration-provider-service';
import { toast } from '@/hooks/use-toast';
import { ProviderFormValues } from '@/components/personas/email/EmailProviderDialog';

export function useEmailAccounts() {
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [configErrorDialogOpen, setConfigErrorDialogOpen] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configErrorProvider, setConfigErrorProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { emailIntegrations, createEmailIntegration, deleteEmailIntegration, isLoadingIntegrations } = usePersonas();

  const onProviderSubmit = (values: ProviderFormValues) => {
    startTransition(() => {
      createEmailIntegration({
        provider: values.provider,
        email: values.email,
      });
      setIsProviderDialogOpen(false);
    });
  };

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
        
        authUrl = await authorizeGmail();
      } else {
        authUrl = await authorizeOutlook();
      }
      
      if (!authUrl) {
        throw new Error(`Failed to get authorization URL from ${provider} service`);
      }
      
      console.log(`Got ${provider} auth URL:`, authUrl);
      
      // The state parameter is now added directly in the edge function
      window.location.href = authUrl;
    } catch (error: any) {
      console.error(`Error connecting to ${provider}:`, error);
      
      // Check for specific error messages
      const errorMessage = error.message || '';
      
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
      
      if (isConnectivityError || isConfigError) {
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

  const handleImportEmails = async (integration: EmailIntegration) => {
    try {
      // For now, we'll just show a toast since the function isn't implemented yet
      toast({
        title: 'Import Feature',
        description: `Email import will be implemented soon.`,
      });
    } catch (error: any) {
      console.error('Error importing emails:', error);
      toast({
        title: 'Import Error',
        description: `Failed to import emails: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = (integration: EmailIntegration) => {
    deleteEmailIntegration(integration.id);
  };

  return {
    emailIntegrations,
    isLoadingIntegrations,
    isProviderDialogOpen,
    setIsProviderDialogOpen,
    configErrorDialogOpen,
    setConfigErrorDialogOpen,
    configError,
    configErrorProvider,
    isLoading,
    loadingProvider,
    onProviderSubmit,
    handleOAuthConnect,
    handleImportEmails,
    handleDisconnect,
  };
}
