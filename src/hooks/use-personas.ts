
import { usePersonasData } from './use-personas-data';
import { useEmailIntegrations } from './use-email-integrations';
import { useEmailContacts } from './use-email-contacts';
import { useEmailMessages } from './use-email-messages';

export const usePersonas = () => {
  const personasData = usePersonasData();
  const emailIntegrationsData = useEmailIntegrations();
  const emailContactsData = useEmailContacts();
  const emailMessagesData = useEmailMessages();

  return {
    // Personas data
    personas: personasData.personas,
    isLoading: personasData.isLoading,
    isError: personasData.isError,
    createPersona: personasData.createPersona,
    updatePersona: personasData.updatePersona,
    deletePersona: personasData.deletePersona,
    
    // Email integrations data
    emailIntegrations: emailIntegrationsData.emailIntegrations,
    createEmailIntegration: emailIntegrationsData.createEmailIntegration,
    
    // Email contacts data
    emailContacts: emailContactsData.emailContacts,
    createEmailContacts: emailContactsData.createEmailContacts,
    
    // Email messages data
    emailMessages: emailMessagesData.emailMessages,
    createEmailMessage: emailMessagesData.createEmailMessage,
    analyzeEmail: emailMessagesData.analyzeEmail,
    isAnalyzing: emailMessagesData.isAnalyzing,
    getEmailAnalysis: emailMessagesData.getEmailAnalysis,
  };
};
