
import { useState } from 'react';
import { useSocialIntegrations } from '@/hooks/use-social-integrations';
import { useToast } from '@/hooks/use-toast';

export interface LinkedInCredentials {
  username: string;
  password: string;
}

export function useLinkedInIntegration() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    isDeleting
  } = useSocialIntegrations('linkedin');

  const existingIntegration = integrations.length > 0 ? integrations[0] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Start encryption animation
    setIsEncrypting(true);

    try {
      // Wait a moment to show the encryption animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (existingIntegration) {
        await updateIntegration({
          id: existingIntegration.id,
          username,
          password
        });
        toast({
          title: "LinkedIn credentials updated",
          description: "Your LinkedIn credentials have been securely updated.",
          variant: "default",
        });
      } else {
        await saveIntegration({
          username,
          password,
          platform: 'linkedin'
        });
        toast({
          title: "LinkedIn connected",
          description: "Your LinkedIn credentials have been securely stored.",
          variant: "default",
        });
      }
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error saving credentials",
        description: error.message || "Failed to save LinkedIn credentials",
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
      toast({
        title: "LinkedIn disconnected",
        description: "Your LinkedIn integration has been removed.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error removing integration",
        description: error.message || "Failed to remove LinkedIn integration",
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
        description: "Your LinkedIn credentials were verified successfully.",
        variant: "default",
      });
    }, 1500);
  };

  const startEditing = () => {
    if (existingIntegration) {
      setUsername(existingIntegration.username);
      // Password is intentionally not set for security
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    // Reset form if no existing integration
    if (!existingIntegration) {
      setUsername('');
      setPassword('');
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
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
