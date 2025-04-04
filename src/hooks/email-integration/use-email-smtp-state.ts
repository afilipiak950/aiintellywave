
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { SocialIntegration } from '@/types/persona';

export function useEmailSMTPState(existingIntegration: SocialIntegration | null) {
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

  // Load existing integration data when component mounts or integrations change
  useEffect(() => {
    if (existingIntegration && !isEditing) {
      setUsername(existingIntegration.username || '');
      setSmtpHost(existingIntegration.smtp_host || '');
      setSmtpPort(existingIntegration.smtp_port || '587');
      setImapHost(existingIntegration.imap_host || '');
      setImapPort(existingIntegration.imap_port || '993');
      // Password is intentionally not set for security
    } else if (!existingIntegration && !isEditing) {
      setUsername(user?.email || '');
      setPassword('');
      setSmtpHost('');
      setSmtpPort('587');
      setImapHost('');
      setImapPort('993');
    }
  }, [existingIntegration, user?.email, isEditing]);

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
    } else {
      // Reset to existing values
      setUsername(existingIntegration.username);
      setSmtpHost(existingIntegration.smtp_host || '');
      setSmtpPort(existingIntegration.smtp_port || '587');
      setImapHost(existingIntegration.imap_host || '');
      setImapPort(existingIntegration.imap_port || '993');
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
    setIsEditing,
    isTesting,
    setIsTesting,
    isEncrypting,
    setIsEncrypting,
    startEditing,
    cancelEditing
  };
}
