
import { usePersonas } from '@/hooks/use-personas';
import { EmailMessage } from '@/types/persona';
import { aggregateAnalysisResults, generateSuggestedPersona } from '@/utils/email-analysis-utils';
import { generatePrompt } from '@/utils/persona-utils';
import { EmailImportFormValues } from '@/components/personas/EmailImportForm';
import { PersonaCreationFormValues } from '@/components/personas/PersonaCreationSheet';
import { supabase } from '@/integrations/supabase/client';

export function useEmailAnalysisHandlers(setters: {
  setSelectedEmail: (email: EmailMessage | null) => void;
  setAnalysisData: (analysis: any) => void;
  setIsAnalysisDialogOpen: (isOpen: boolean) => void;
  setAggregatedAnalysis: (analysis: any) => void;
  setSuggestedPersona: (persona: any) => void;
  setIsPersonaSheetOpen: (isOpen: boolean) => void;
  setIsImportDialogOpen: (isOpen: boolean) => void;
  setSelectedEmails: (emails: string[]) => void;
  setIsBatchAnalyzing: (isAnalyzing: boolean) => void;
}) {
  const { 
    emailMessages, 
    createEmailMessage, 
    analyzeEmail, 
    getEmailAnalysis,
    createPersona
  } = usePersonas();

  const onEmailImportSubmit = async (values: EmailImportFormValues) => {
    try {
      const emailPromises = values.emailBodies.map(async ({ body }) => {
        const messageData = { body };
        return await createEmailMessage(messageData);
      });

      const createdEmails = await Promise.all(emailPromises);
      
      setters.setIsImportDialogOpen(false);
      
      const analysisPromises = createdEmails.map(email => 
        analyzeEmail({
          emailId: email.id,
          emailContent: email.body,
        })
      );
      
      await Promise.all(analysisPromises);
      
      const analysesPromises = createdEmails.map(email => getEmailAnalysis(email.id));
      const analyses = await Promise.all(analysesPromises);
      
      const validAnalyses = analyses.filter(Boolean) as any[];
      
      if (validAnalyses.length > 0) {
        const aggregated = aggregateAnalysisResults(validAnalyses);
        setters.setAggregatedAnalysis(aggregated);
        
        const suggestedPersonaData = generateSuggestedPersona(aggregated);
        setters.setSuggestedPersona(suggestedPersonaData);
        
        setters.setIsPersonaSheetOpen(true);
      }
    } catch (error) {
      console.error('Error importing emails:', error);
    }
  };

  const onPersonaSubmit = async (values: PersonaCreationFormValues) => {
    try {
      // Get the suggested persona data
      const suggestedPersona = setters.setSuggestedPersona as unknown as () => any;
      
      const personaData = {
        name: values.name,
        function: values.function,
        style: values.style,
        prompt: generatePrompt({
          name: values.name,
          function: values.function,
          style: values.style
        })
      };
      
      await createPersona(personaData);
      
      setters.setIsPersonaSheetOpen(false);
      setters.setSuggestedPersona(null);
    } catch (error) {
      console.error('Error creating persona:', error);
    }
  };

  const handleViewAnalysis = async (email: EmailMessage) => {
    setters.setSelectedEmail(email);
    
    try {
      const analysis = await getEmailAnalysis(email.id);
      
      if (analysis) {
        setters.setAnalysisData(analysis);
        setters.setIsAnalysisDialogOpen(true);
      } else {
        await analyzeEmail({
          emailId: email.id,
          emailContent: email.body,
        });
        
        const updatedAnalysis = await getEmailAnalysis(email.id);
        if (updatedAnalysis) {
          setters.setAnalysisData(updatedAnalysis);
        }
        
        setters.setIsAnalysisDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const handleAnalyzeNow = async () => {
    const selectedEmail = setters.setSelectedEmail as unknown as () => EmailMessage | null;
    if (!selectedEmail) return;
    
    try {
      await analyzeEmail({
        emailId: selectedEmail().id,
        emailContent: selectedEmail().body,
      });
      
      const updatedAnalysis = await getEmailAnalysis(selectedEmail().id);
      if (updatedAnalysis) {
        setters.setAnalysisData(updatedAnalysis);
      }
    } catch (error) {
      console.error('Error analyzing email:', error);
    }
  };

  const handleAnalyzeSelected = async (selectedEmails: string[]) => {
    if (selectedEmails.length === 0) return;
    
    try {
      setters.setIsBatchAnalyzing(true);
      
      for (const emailId of selectedEmails) {
        const { data } = await supabase
          .from('email_messages')
          .select('*')
          .eq('id', emailId)
          .single();
          
        if (data) {
          await analyzeEmail({
            emailId: data.id,
            emailContent: data.body,
          });
        }
      }
      
      setters.setSelectedEmails([]);
    } catch (error) {
      console.error('Error batch analyzing emails:', error);
    } finally {
      setters.setIsBatchAnalyzing(false);
    }
  };

  const handleCreatePersonaFromSelected = async (selectedEmails: string[]) => {
    if (selectedEmails.length === 0) return;
    
    try {
      const analysesPromises = selectedEmails.map(emailId => getEmailAnalysis(emailId));
      const analyses = await Promise.all(analysesPromises);
      
      const validAnalyses = analyses.filter(Boolean) as any[];
      
      if (validAnalyses.length > 0) {
        const aggregated = aggregateAnalysisResults(validAnalyses);
        setters.setAggregatedAnalysis(aggregated);
        
        const suggestedPersonaData = generateSuggestedPersona(aggregated);
        setters.setSuggestedPersona(suggestedPersonaData);
        
        setters.setIsPersonaSheetOpen(true);
        setters.setSelectedEmails([]);
      }
    } catch (error) {
      console.error('Error creating persona from selected emails:', error);
    }
  };

  return {
    onEmailImportSubmit,
    onPersonaSubmit,
    handleViewAnalysis,
    handleAnalyzeNow,
    handleAnalyzeSelected,
    handleCreatePersonaFromSelected,
  };
}
