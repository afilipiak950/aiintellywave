
import { useState } from 'react';
import { useOAuthConnection } from './email-accounts/use-oauth-connection';
import { useProviderDialog } from './email-accounts/use-provider-dialog';
import { useEmailIntegrations } from './email-accounts/use-email-integrations';

export const useEmailAccounts = () => {
  const {
    emailIntegrations,
    isLoading: isLoadingIntegrations,
    isError: isErrorIntegrations,
    createEmailIntegration,
    deleteEmailIntegration,
    importIntegrationEmails,
    isImporting,
  } = useEmailIntegrations();

  const {
    isLoading,
    loadingProvider,
    configErrorDialogOpen,
    setConfigErrorDialogOpen,
    verificationErrorDialogOpen,
    setVerificationErrorDialogOpen,
    configError,
    configErrorProvider,
    handleOAuthConnect,
  } = useOAuthConnection();

  const {
    isProviderDialogOpen,
    setIsProviderDialogOpen,
    isPending,
    onProviderSubmit,
  } = useProviderDialog();

  const handleImportEmails = async (integrationId: string, provider: string) => {
    await importIntegrationEmails(integrationId, provider);
  };

  const handleDisconnect = async (integrationId: string) => {
    await deleteEmailIntegration(integrationId);
  };

  return {
    // Email integrations
    emailIntegrations,
    isLoadingIntegrations,
    isErrorIntegrations,
    
    // Provider dialog
    isProviderDialogOpen,
    setIsProviderDialogOpen,
    isPending: isPending,
    onProviderSubmit,
    
    // OAuth connection
    isLoading,
    loadingProvider,
    configErrorDialogOpen,
    setConfigErrorDialogOpen,
    verificationErrorDialogOpen,
    setVerificationErrorDialogOpen,
    configError,
    configErrorProvider,
    handleOAuthConnect,
    
    // Integration actions
    handleImportEmails,
    handleDisconnect,
  };
};
