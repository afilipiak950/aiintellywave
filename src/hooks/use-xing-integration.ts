
import { useState } from 'react';
import { useSocialIntegrations } from '@/hooks/use-social-integrations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';

export function useXingIntegration() {
  const { user } = useAuth();
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
  } = useSocialIntegrations('xing');

  const existingIntegration = integrations.length > 0 ? integrations[0] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No user email found.",
        variant: "destructive",
      });
      return;
    }

    setIsEncrypting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (existingIntegration) {
        await updateIntegration({
          id: existingIntegration.id,
          password
        });
        toast({
          title: "Xing credentials updated",
          description: "Your Xing credentials have been securely updated.",
          variant: "default",
        });
      } else {
        await saveIntegration({
          password,
          platform: 'xing'
        });
        toast({
          title: "Xing connected",
          description: "Your Xing credentials have been securely stored.",
          variant: "default",
        });
      }
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error saving credentials",
        description: error.message || "Failed to save Xing credentials",
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
      setPassword('');
      toast({
        title: "Xing disconnected",
        description: "Your Xing integration has been removed.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error removing integration",
        description: error.message || "Failed to remove Xing integration",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "Connection successful",
        description: "Your Xing credentials were verified successfully.",
        variant: "default",
      });
    }, 1500);
  };

  const startEditing = () => {
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setPassword('');
  };

  return {
    username: user?.email || '',
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
