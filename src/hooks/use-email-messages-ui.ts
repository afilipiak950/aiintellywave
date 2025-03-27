
import { useState } from 'react';
import { usePersonas } from '@/hooks/use-personas';
import { EmailMessage, EmailAnalysis, AIPersona } from '@/types/persona';
import { aggregateAnalysisResults, generateSuggestedPersona } from '@/utils/email-analysis-utils';
import { generatePrompt } from '@/utils/persona-utils';
import { EmailImportFormValues } from '@/components/personas/EmailImportForm';
import { PersonaCreationFormValues } from '@/components/personas/PersonaCreationSheet';
import { supabase } from '@/integrations/supabase/client';

export function useEmailMessagesUI() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [analysisData, setAnalysisData] = useState<EmailAnalysis | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [aggregatedAnalysis, setAggregatedAnalysis] = useState<any>(null);
  const [isPersonaSheetOpen, setIsPersonaSheetOpen] = useState(false);
  const [suggestedPersona, setSuggestedPersona] = useState<Partial<AIPersona> | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isEmailListExpanded, setIsEmailListExpanded] = useState(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  
  const { 
    emailMessages, 
    createEmailMessage, 
    analyzeEmail, 
    isAnalyzing,
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
      
      setIsImportDialogOpen(false);
      
      const analysisPromises = createdEmails.map(email => 
        analyzeEmail({
          emailId: email.id,
          emailContent: email.body,
        })
      );
      
      await Promise.all(analysisPromises);
      
      const analysesPromises = createdEmails.map(email => getEmailAnalysis(email.id));
      const analyses = await Promise.all(analysesPromises);
      
      const validAnalyses = analyses.filter(Boolean) as EmailAnalysis[];
      
      if (validAnalyses.length > 0) {
        const aggregated = aggregateAnalysisResults(validAnalyses);
        setAggregatedAnalysis(aggregated);
        
        const suggestedPersonaData = generateSuggestedPersona(aggregated);
        setSuggestedPersona(suggestedPersonaData);
        
        setIsPersonaSheetOpen(true);
      }
    } catch (error) {
      console.error('Error importing emails:', error);
    }
  };

  const onPersonaSubmit = async (values: PersonaCreationFormValues) => {
    try {
      if (!suggestedPersona) return;
      
      const personaData: Omit<AIPersona, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
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
      
      setIsPersonaSheetOpen(false);
      setSuggestedPersona(null);
    } catch (error) {
      console.error('Error creating persona:', error);
    }
  };

  const handleViewAnalysis = async (email: EmailMessage) => {
    setSelectedEmail(email);
    
    try {
      const analysis = await getEmailAnalysis(email.id);
      
      if (analysis) {
        setAnalysisData(analysis);
        setIsAnalysisDialogOpen(true);
      } else {
        await analyzeEmail({
          emailId: email.id,
          emailContent: email.body,
        });
        
        const updatedAnalysis = await getEmailAnalysis(email.id);
        if (updatedAnalysis) {
          setAnalysisData(updatedAnalysis);
        }
        
        setIsAnalysisDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const handleAnalyzeNow = async () => {
    if (!selectedEmail) return;
    
    try {
      await analyzeEmail({
        emailId: selectedEmail.id,
        emailContent: selectedEmail.body,
      });
      
      const updatedAnalysis = await getEmailAnalysis(selectedEmail.id);
      if (updatedAnalysis) {
        setAnalysisData(updatedAnalysis);
      }
    } catch (error) {
      console.error('Error analyzing email:', error);
    }
  };

  const handleAnalyzeSelected = async () => {
    if (selectedEmails.length === 0) return;
    
    try {
      setIsBatchAnalyzing(true);
      
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
      
      setSelectedEmails([]);
    } catch (error) {
      console.error('Error batch analyzing emails:', error);
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  const handleCreatePersonaFromSelected = async () => {
    if (selectedEmails.length === 0) return;
    
    try {
      const analysesPromises = selectedEmails.map(emailId => getEmailAnalysis(emailId));
      const analyses = await Promise.all(analysesPromises);
      
      const validAnalyses = analyses.filter(Boolean) as EmailAnalysis[];
      
      if (validAnalyses.length > 0) {
        const aggregated = aggregateAnalysisResults(validAnalyses);
        setAggregatedAnalysis(aggregated);
        
        const suggestedPersonaData = generateSuggestedPersona(aggregated);
        setSuggestedPersona(suggestedPersonaData);
        
        setIsPersonaSheetOpen(true);
        setSelectedEmails([]);
      }
    } catch (error) {
      console.error('Error creating persona from selected emails:', error);
    }
  };

  const toggleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleToggleExpand = () => {
    setIsEmailListExpanded(!isEmailListExpanded);
  };

  const displayedEmails = isEmailListExpanded ? emailMessages : emailMessages.slice(0, 5);

  return {
    // State
    isImportDialogOpen,
    setIsImportDialogOpen,
    selectedEmail,
    analysisData,
    isAnalysisDialogOpen,
    setIsAnalysisDialogOpen,
    aggregatedAnalysis,
    isPersonaSheetOpen,
    setIsPersonaSheetOpen,
    suggestedPersona,
    selectedEmails,
    isEmailListExpanded,
    isBatchAnalyzing,
    emailMessages,
    displayedEmails,
    isAnalyzing,
    
    // Handlers
    onEmailImportSubmit,
    onPersonaSubmit,
    handleViewAnalysis,
    handleAnalyzeNow,
    handleAnalyzeSelected,
    handleCreatePersonaFromSelected,
    toggleSelectEmail,
    handleToggleExpand
  };
}
