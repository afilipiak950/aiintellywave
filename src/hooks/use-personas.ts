
import { useEmailMessages } from './use-email-messages';
import { useEmailIntegrations } from './use-email-integrations';
import { useEmailContacts } from './use-email-contacts';
import { usePersonasData } from './use-personas-data';
import { AIPersona } from '@/types/persona';

export const usePersonas = () => {
  // Email messages hook
  const {
    emailMessages,
    isLoadingMessages,
    isErrorMessages,
    createEmailMessage,
    analyzeEmail,
    isAnalyzing,
    getEmailAnalysis,
  } = useEmailMessages();

  // Email integrations hook
  const {
    emailIntegrations,
    isLoading: isLoadingIntegrations,
    isError: isErrorIntegrations,
    createEmailIntegration,
  } = useEmailIntegrations();

  // Email contacts hook
  const {
    emailContacts,
    isLoading: isLoadingContacts,
    isError: isErrorContacts,
    createEmailContacts,
  } = useEmailContacts();

  // Personas data hook
  const {
    personas,
    isLoading,
    isError,
    createPersona,
    updatePersona,
    deletePersona,
  } = usePersonasData();

  return {
    // Email messages
    emailMessages,
    isLoadingMessages,
    isErrorMessages,
    createEmailMessage,
    analyzeEmail,
    isAnalyzing,
    getEmailAnalysis,
    
    // Email integrations
    emailIntegrations,
    isLoadingIntegrations,
    isErrorIntegrations,
    createEmailIntegration,
    
    // Email contacts
    emailContacts,
    isLoadingContacts,
    isErrorContacts,
    createEmailContacts,
    
    // Personas
    personas,
    isLoading,
    isError,
    createPersona,
    updatePersona,
    deletePersona,
  };
};
