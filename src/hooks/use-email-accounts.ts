
import { useState, useTransition } from 'react';
import { usePersonas } from '@/hooks/use-personas';
import { EmailIntegration } from '@/types/persona';
import { authorizeGmail, authorizeOutlook } from '@/services/email-integration-provider-service';
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
        authUrl = await authorizeGmail();
      } else {
        authUrl = await authorizeOutlook();
      }
      
      if (!authUrl) {
        throw new Error(`Failed to get authorization URL from ${provider} service`);
      }
      
      console.log(`Got ${provider} auth URL:`, authUrl);
      
      // Add state parameter to track provider
      const stateParam = authUrl.includes('?') ? `&state=${provider}` : `?state=${provider}`;
      window.location.href = authUrl + stateParam;
    } catch (error: any) {
      console.error(`Error connecting to ${provider}:`, error);
      
      // Check for specific error messages
      const errorMessage = error.message || '';
      
      // Check if it's likely a configuration issue
      const isConfigError = 
        errorMessage.includes('environment variable') || 
        errorMessage.includes('not set') || 
        errorMessage.includes('Missing') ||
        errorMessage.includes('Invalid response') ||
        errorMessage.includes('non-2xx status code');
      
      if (isConfigError) {
        setConfigErrorProvider(provider);
        
        // Set appropriate error message based on provider
        if (provider === 'gmail') {
          setConfigError(`The Gmail integration is not properly configured. The server administrator needs to set up the required API credentials. ${errorMessage}`);
        } else {
          setConfigError(`The Outlook integration is not properly configured. The server administrator needs to set up the required API credentials. ${errorMessage}`);
        }
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
