
import { useState } from 'react';
import { useEmailSMTPIntegration } from './use-email-smtp-integration';

export const useEmailAccounts = () => {
  // Just using SMTP integration now, OAuth has been removed
  const {
    username,
    password,
    smtpHost,
    smtpPort,
    imapHost,
    imapPort,
    existingIntegration,
    isLoading,
    isEditing,
    startEditing,
    cancelEditing,
    handleSubmit,
    handleDelete,
    handleTestConnection
  } = useEmailSMTPIntegration();

  return {
    // Email SMTP integration
    username,
    password,
    smtpHost,
    smtpPort,
    imapHost,
    imapPort,
    existingIntegration,
    isLoading,
    isEditing,
    startEditing,
    cancelEditing,
    handleSubmit,
    handleDelete,
    handleTestConnection,
  };
};
