
import { useEmailIntegrations } from './use-email-integrations';
import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';

export const useEmailIntegrationsWithSecurity = () => {
  const {
    emailIntegrations,
    isLoading,
    isError,
    createEmailIntegration,
    deleteEmailIntegration
  } = useEmailIntegrations();
  
  const [isDecrypting, setIsDecrypting] = useState<Record<string, boolean>>({});
  const [visibleCredentials, setVisibleCredentials] = useState<Record<string, boolean>>({});
  
  const { user, isAdmin } = useAuth();
  // We'll now use the isAdmin from useAuth() instead of checking user_metadata
  
  // Toggle visibility of credentials
  const toggleCredentialVisibility = (integrationId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "Only administrators can view decrypted credentials",
        variant: "destructive"
      });
      return;
    }
    
    // Show decryption animation
    if (!visibleCredentials[integrationId]) {
      setIsDecrypting(prev => ({ ...prev, [integrationId]: true }));
      
      // Simulate decryption process
      setTimeout(() => {
        setIsDecrypting(prev => ({ ...prev, [integrationId]: false }));
        setVisibleCredentials(prev => ({ 
          ...prev, 
          [integrationId]: !prev[integrationId] 
        }));
      }, 1000);
    } else {
      // Immediately hide credentials without animation
      setVisibleCredentials(prev => ({ 
        ...prev, 
        [integrationId]: !prev[integrationId] 
      }));
    }
  };
  
  // Log credential access attempts
  const logCredentialAccess = (integrationId: string, action: 'view' | 'hide') => {
    if (!isAdmin || !user) return;
    
    console.log(`AUDIT LOG: Admin ${user.id} ${action === 'view' ? 'viewed' : 'hid'} credentials for integration ${integrationId}`);
    
    // In a real application, you would send this to your backend logging system
  };
  
  // Check if credentials are visible for a specific integration
  const isCredentialVisible = (integrationId: string): boolean => {
    return !!visibleCredentials[integrationId];
  };
  
  // Check if credentials are being "decrypted" (animation)
  const isCredentialDecrypting = (integrationId: string): boolean => {
    return !!isDecrypting[integrationId];
  };

  return {
    emailIntegrations,
    isLoading,
    isError,
    createEmailIntegration,
    deleteEmailIntegration,
    // Security features
    toggleCredentialVisibility,
    isCredentialVisible,
    isCredentialDecrypting,
    isAdmin
  };
};
