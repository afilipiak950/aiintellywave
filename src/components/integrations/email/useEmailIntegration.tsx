
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useEmailSMTPIntegration } from '@/hooks/email-integration/use-email-smtp-integration';
import { useToast } from '@/hooks/use-toast';
import { EmailFormValues } from './types';

export const useEmailIntegration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { toast } = useToast();
  
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
    existingIntegration,
    handleSubmit: submitIntegration,
    handleTestConnection: testIntegrationConnection,
    isLoading,
    refreshIntegrations
  } = useEmailSMTPIntegration();
  
  const form = useForm<EmailFormValues>({
    defaultValues: {
      email: username || '',
      smtpServer: smtpHost || '',
      smtpPort: smtpPort || '587',
      imapServer: imapHost || '',
      imapPort: imapPort || '993',
      password: ''
    }
  });
  
  // Update form values when integration data changes
  useEffect(() => {
    console.log("Updating form with values:", {
      email: username,
      smtpServer: smtpHost,
      smtpPort,
      imapServer: imapHost,
      imapPort,
    });
    
    form.reset({
      email: username || '',
      smtpServer: smtpHost || '',
      smtpPort: smtpPort || '587',
      imapServer: imapHost || '',
      imapPort: imapPort || '993',
      password: existingIntegration ? '********' : ''
    });
  }, [username, smtpHost, smtpPort, imapHost, imapPort, existingIntegration, form]);

  // Refresh integrations data when component mounts
  useEffect(() => {
    refreshIntegrations();
  }, [refreshIntegrations]);

  const onSubmit = async (data: EmailFormValues) => {
    setIsSubmitting(true);
    setIsEncrypting(true);
    
    try {
      console.log("Submitting email configuration:", {
        ...data,
        password: "***REDACTED***"
      });
      
      // Update state values from form
      setUsername(data.email);
      // Only use the new password if provided (not the placeholder)
      if (data.password && data.password !== '********') {
        setPassword(data.password);
      }
      setSmtpHost(data.smtpServer);
      setSmtpPort(data.smtpPort);
      setImapHost(data.imapServer);
      setImapPort(data.imapPort);
      
      // Wait for encryption animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Submit using the hook's handler
      await submitIntegration({ preventDefault: () => {} } as React.FormEvent);
      
      // Ensure we get the latest data
      await refreshIntegrations();
      
      toast({
        title: existingIntegration ? "Email settings updated" : "Email connected",
        description: "Your email configuration has been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error saving configuration",
        description: error.message || "Failed to save email configuration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsEncrypting(false);
    }
  };

  const handleTest = useCallback(async () => {
    setIsTesting(true);
    try {
      await testIntegrationConnection();
    } finally {
      setIsTesting(false);
    }
  }, [testIntegrationConnection]);

  return {
    form,
    isSubmitting,
    isTesting,
    isEncrypting,
    isLoading,
    existingIntegration,
    onSubmit,
    handleTest
  };
};
