
import { useState } from 'react';
import { useEmailSMTPIntegration } from './use-email-smtp-integration';
import { useSocialIntegrations } from './use-social-integrations';

export const useEmailAccounts = () => {
  // State for dialogs
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [configErrorDialogOpen, setConfigErrorDialogOpen] = useState(false);
  const [verificationErrorDialogOpen, setVerificationErrorDialogOpen] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configErrorProvider, setConfigErrorProvider] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  
  // Get SMTP integration
  const smtpIntegration = useEmailSMTPIntegration();
  
  // Get the list of integrations for display
  const { integrations: emailIntegrations, isLoading: isLoadingIntegrations } = useSocialIntegrations('email_smtp');
  
  // Provider submit handler
  const onProviderSubmit = async (formData: any) => {
    try {
      await smtpIntegration.handleSubmit(formData);
      setIsProviderDialogOpen(false);
    } catch (error: any) {
      setConfigError(error.message);
      setConfigErrorProvider('SMTP');
      setConfigErrorDialogOpen(true);
    }
  };
  
  // Placeholder functions for compatibility with EmailAccountsCard
  const handleOAuthConnect = () => {
    console.log('OAuth connect not implemented');
  };
  
  const handleImportEmails = () => {
    console.log('Import emails not implemented');
  };
  
  const handleDisconnect = async (id: string) => {
    try {
      await smtpIntegration.handleDelete();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return {
    // Email SMTP integration properties
    ...smtpIntegration,
    
    // Additional properties needed by EmailAccountsCard
    emailIntegrations,
    isLoadingIntegrations,
    isErrorIntegrations: false,
    isProviderDialogOpen,
    setIsProviderDialogOpen,
    configErrorDialogOpen,
    setConfigErrorDialogOpen,
    verificationErrorDialogOpen,
    setVerificationErrorDialogOpen,
    configError,
    configErrorProvider,
    loadingProvider,
    onProviderSubmit,
    handleOAuthConnect,
    handleImportEmails,
    handleDisconnect,
  };
};
