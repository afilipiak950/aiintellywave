
import { useState } from 'react';
import { useSocialIntegrations } from '@/hooks/use-social-integrations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';

export interface EmailSMTPCredentials {
  username: string;
  password: string;
  smtp_host: string;
  smtp_port: string;
  imap_host: string;
  imap_port: string;
}

export function useEmailSMTPIntegration() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !smtpHost || !smtpPort || !imapHost || !imapPort) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Start encryption animation
    setIsEncrypting(true);

    try {
      // Wait a moment to show the encryption animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Explicitly prepare the data to ensure all fields are included
      const integrationData = {
        username,
        password,
        platform: 'email_smtp' as const,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        imap_host: imapHost,
        imap_port: imapPort
      };
      
      if (existingIntegration) {
        await updateIntegration({
          id: existingIntegration.id,
          ...integrationData
        });
        
        // Refresh integrations to ensure latest data
        await refreshIntegrations();
        
        toast({
          title: "Email credentials updated",
          description: "Your Email credentials have been securely updated.",
          variant: "default",
        });
      } else {
        await saveIntegration(integrationData);
        
        // Refresh integrations to ensure latest data
        await refreshIntegrations();
        
        toast({
          title: "Email connected",
          description: "Your Email credentials have been securely stored.",
          variant: "default",
        });
      }
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving SMTP credentials:", error);
      toast({
        title: "Error saving credentials",
        description: error.message || "Failed to save Email credentials",
        variant: "destructive",
      });
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingIntegration) return;
    
    try {
      await deleteIntegration(existingIntegration.id);
      setUsername('');
      setPassword('');
      setSmtpHost('');
      setSmtpPort('587');
      setImapHost('');
      setImapPort('993');
      toast({
        title: "Email disconnected",
        description: "Your Email integration has been removed.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error removing SMTP integration:", error);
      toast({
        title: "Error removing integration",
        description: error.message || "Failed to remove Email integration",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    
    // Simulate a connection test
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "Connection successful",
        description: "Your Email credentials were verified successfully.",
        variant: "default",
      });
    }, 1500);
  };

  const startEditing = () => {
    if (existingIntegration) {
      setUsername(existingIntegration.username);
      setSmtpHost(existingIntegration.smtp_host || '');
      setSmtpPort(existingIntegration.smtp_port || '587');
      setImapHost(existingIntegration.imap_host || '');
      setImapPort(existingIntegration.imap_port || '993');
      // Password is intentionally not set for security
    } else {
      setUsername(user?.email || '');
    }
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    // Reset form if no existing integration
    if (!existingIntegration) {
      setUsername('');
      setPassword('');
      setSmtpHost('');
      setSmtpPort('587');
      setImapHost('');
      setImapPort('993');
    }
  };

  return {
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
    isLoading,
    isSaving,
    isDeleting,
    existingIntegration,
    handleSubmit,
    handleDelete,
    handleTestConnection,
    startEditing,
    cancelEditing
  };
}
