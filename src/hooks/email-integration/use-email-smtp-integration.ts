
import { useSocialIntegrations } from '@/hooks/use-social-integrations';
import { useEmailSMTPState } from './use-email-smtp-state';
import { useEmailSMTPHandlers } from './use-email-smtp-handlers';
import { EmailSMTPCredentials } from './types';

export { EmailSMTPCredentials } from './types';

export function useEmailSMTPIntegration() {
  // Get social integrations for email_smtp platform
  const {
    integrations,
    isLoading,
    saveIntegration,
    updateIntegration,
    deleteIntegration,
    isSaving,
    isDeleting,
    refresh: refreshIntegrations
  } = useSocialIntegrations('email_smtp');

  const existingIntegration = integrations.length > 0 ? integrations[0] : null;

  // Manage form state
  const {
    username,
    setUsername,
    password,
    setPassword,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    imapHost,
    setImapHost,
    imapPort,
    setImapPort,
    isEditing,
    setIsEditing,
    isTesting,
    setIsTesting,
    isEncrypting,
    setIsEncrypting,
    startEditing,
    cancelEditing
  } = useEmailSMTPState(existingIntegration);

  // Set up handlers
  const {
    handleSubmit,
    handleDelete,
    handleTestConnection
  } = useEmailSMTPHandlers({
    username,
    password,
    smtpHost,
    smtpPort,
    imapHost,
    imapPort,
    setIsEditing,
    setIsTesting,
    setIsEncrypting,
    existingIntegration,
    saveIntegration,
    updateIntegration,
    deleteIntegration,
    refreshIntegrations
  });

  return {
    // State
    username,
    setUsername,
    password,
    setPassword,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    imapHost,
    setImapHost,
    imapPort,
    setImapPort,
    isEditing,
    isTesting,
    isEncrypting,
    
    // API state
    isLoading,
    isSaving,
    isDeleting,
    existingIntegration,
    
    // Handlers
    handleSubmit,
    handleDelete,
    handleTestConnection,
    startEditing,
    cancelEditing,
    
    // Utils
    refreshIntegrations
  };
}
