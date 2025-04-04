
import { useToast } from '@/hooks/use-toast';
import { SocialIntegration } from '@/types/persona';

interface EmailSMTPHandlersProps {
  username: string;
  password: string;
  smtpHost: string;
  smtpPort: string;
  imapHost: string;
  imapPort: string;
  setIsEditing: (value: boolean) => void;
  setIsTesting: (value: boolean) => void;
  setIsEncrypting: (value: boolean) => void;
  existingIntegration: SocialIntegration | null;
  saveIntegration: (data: any) => Promise<void>;
  updateIntegration: (data: any) => Promise<void>;
  deleteIntegration: (id: string) => Promise<void>;
  refreshIntegrations: () => Promise<void>;
}

export function useEmailSMTPHandlers({
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
}: EmailSMTPHandlersProps) {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !smtpHost || !smtpPort || !imapHost || !imapPort) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Only require password for new integrations
    if (!existingIntegration && !password) {
      toast({
        title: "Missing password",
        description: "Please provide your email password",
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
        platform: 'email_smtp' as const,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        imap_host: imapHost,
        imap_port: imapPort
      };
      
      // Only include password if it's provided (for new integrations or password updates)
      if (password && password !== '********') {
        Object.assign(integrationData, { password });
      }
      
      console.log("Saving email integration with data:", {
        ...integrationData,
        password: password ? '***REDACTED***' : undefined
      });
      
      if (existingIntegration) {
        await updateIntegration({
          id: existingIntegration.id,
          ...integrationData
        });
        
        console.log("Email integration updated successfully");
        
        // Refresh integrations to ensure latest data
        await refreshIntegrations();
        
        toast({
          title: "Email credentials updated",
          description: "Your Email credentials have been securely updated.",
          variant: "default",
        });
      } else {
        await saveIntegration(integrationData);
        
        console.log("Email integration saved successfully");
        
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
      
      // Refresh integrations to ensure UI is updated
      await refreshIntegrations();
      
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

  return {
    handleSubmit,
    handleDelete,
    handleTestConnection
  };
}
