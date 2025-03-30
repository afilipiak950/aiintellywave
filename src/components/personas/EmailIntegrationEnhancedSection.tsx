
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmailIntegrationsWithSecurity } from '@/hooks/email-accounts/use-email-integrations-with-security';
import { useEmailAccounts } from '@/hooks/use-email-accounts';
import EmailIntegrationSecuritySection from './EmailIntegrationSecuritySection';

const EmailIntegrationEnhancedSection = () => {
  const { 
    emailIntegrations,
    isLoading,
    deleteEmailIntegration,
    isCredentialVisible,
    isCredentialDecrypting,
    toggleCredentialVisibility
  } = useEmailIntegrationsWithSecurity();
  
  const { 
    setIsProviderDialogOpen,
    handleOAuthConnect 
  } = useEmailAccounts();

  // Function to handle updating an integration
  const handleUpdateIntegration = async (id: string, data: any) => {
    // In a real application, we would call an update function here
    console.log('Updating integration', id, data);
    // This would typically call an update function from the hook
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-semibold tracking-tight">Email Integrations</h2>
        <Button 
          onClick={() => setIsProviderDialogOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Integration
        </Button>
      </motion.div>
      
      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      ) : emailIntegrations.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-muted/50 border rounded-lg p-8 text-center"
        >
          <p className="text-muted-foreground mb-4">
            No email integrations connected yet. Add an integration to get started.
          </p>
          <Button 
            onClick={() => setIsProviderDialogOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Connect Email Account
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {emailIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <EmailIntegrationSecuritySection
                integration={integration}
                onUpdate={handleUpdateIntegration}
                onDelete={deleteEmailIntegration}
                isVisible={isCredentialVisible(integration.id)}
                isDecrypting={isCredentialDecrypting(integration.id)}
                onToggleVisibility={() => toggleCredentialVisibility(integration.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default EmailIntegrationEnhancedSection;
