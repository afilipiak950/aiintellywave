
import { usePersonas } from '@/hooks/use-personas';
import { useProviderDialog } from './email-accounts/use-provider-dialog';
import { useOAuthConnection } from './email-accounts/use-oauth-connection';
import { useIntegrationActions } from './email-accounts/use-integration-actions';

export function useEmailAccounts() {
  const { emailIntegrations, isLoadingIntegrations } = usePersonas();
  
  // Use specialized hooks
  const providerDialog = useProviderDialog();
  const oauthConnection = useOAuthConnection();
  const integrationActions = useIntegrationActions();

  return {
    // Email integrations data
    emailIntegrations,
    isLoadingIntegrations,
    
    // Provider dialog state and handlers
    isProviderDialogOpen: providerDialog.isProviderDialogOpen,
    setIsProviderDialogOpen: providerDialog.setIsProviderDialogOpen,
    onProviderSubmit: providerDialog.onProviderSubmit,
    
    // OAuth connection state and handlers
    configErrorDialogOpen: oauthConnection.configErrorDialogOpen,
    setConfigErrorDialogOpen: oauthConnection.setConfigErrorDialogOpen,
    configError: oauthConnection.configError,
    configErrorProvider: oauthConnection.configErrorProvider,
    isLoading: oauthConnection.isLoading,
    loadingProvider: oauthConnection.loadingProvider,
    handleOAuthConnect: oauthConnection.handleOAuthConnect,
    
    // Integration actions
    handleImportEmails: integrationActions.handleImportEmails,
    handleDisconnect: integrationActions.handleDisconnect,
  };
}
