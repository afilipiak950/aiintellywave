
import { useEmailMessages } from './use-email-messages';
import { AIPersona } from '@/types/persona';

export const usePersonas = () => {
  const {
    emailMessages,
    isLoadingMessages,
    isErrorMessages,
    createEmailMessage,
    analyzeEmail,
    isAnalyzing,
    getEmailAnalysis,
  } = useEmailMessages();

  // Mock implementation for createPersona until you implement this
  const createPersona = async (personaData: Omit<AIPersona, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    console.log('Creating persona:', personaData);
    // Here you would call your API to create the persona
    // For now, just return a mock response
    return {
      id: 'persona-' + Date.now(),
      user_id: 'user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...personaData,
    };
  };

  return {
    emailMessages,
    isLoadingMessages,
    isErrorMessages,
    createEmailMessage,
    analyzeEmail,
    isAnalyzing,
    getEmailAnalysis,
    createPersona,
  };
};
