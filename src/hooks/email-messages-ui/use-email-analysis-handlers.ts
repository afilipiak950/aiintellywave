
import { usePersonas } from '@/hooks/use-personas';
import { EmailMessage } from '@/types/persona';
import { aggregateAnalysisResults, generateSuggestedPersona } from '@/utils/email-analysis-utils';
import { generatePrompt } from '@/utils/persona-utils';
import { EmailImportFormValues } from '@/components/personas/EmailImportForm';
import { PersonaCreationFormValues } from '@/components/personas/schemas/persona-form-schema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    personas,
    createEmailMessage, 
    analyzeEmail, 
    getEmailAnalysis,
    createPersona,
    updatePersona
  } = usePersonas();

  const onEmailImportSubmit = async (values: EmailImportFormValues) => {
    try {
      const emailPromises = values.emailBodies.map(async ({ body }) => {
        const messageData = { body };
        return await createEmailMessage(messageData);
      });

      const createdEmails = await Promise.all(emailPromises);
      
      setters.setIsImportDialogOpen(false);
      
      // Automatically analyze all emails
      const analysisPromises = createdEmails.map(email => 
        analyzeEmail({
          emailId: email.id,
          emailContent: email.body,
        })
      );
      
      await Promise.all(analysisPromises);
      toast({
        title: "Emails Analyzed",
        description: `Successfully analyzed ${createdEmails.length} emails`,
      });
      
      // Fetch all analyses
      const analysesPromises = emailMessages.map(email => getEmailAnalysis(email.id));
      const analyses = await Promise.all(analysesPromises);
      
      const validAnalyses = analyses.filter(Boolean) as any[];
      
      if (validAnalyses.length > 0) {
        const aggregated = aggregateAnalysisResults(validAnalyses);
        setters.setAggregatedAnalysis(aggregated);
        
        const suggestedPersonaData = generateSuggestedPersona(aggregated);
        setters.setSuggestedPersona(suggestedPersonaData);
        
        // Check if a persona already exists
        if (personas.length > 0) {
          // Update the first existing persona
          await updateExistingPersona(suggestedPersonaData);
        } else {
          // Create a new persona automatically
          await createPersonaAutomatically(suggestedPersonaData);
        }
      }
    } catch (error) {
      console.error('Error importing emails:', error);
      toast({
        title: "Import Error",
        description: "Failed to import and analyze emails. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createPersonaAutomatically = async (suggestedPersona: any) => {
    try {
      // Create persona data from suggested values
      const personaData = {
        name: suggestedPersona.name,
        function: suggestedPersona.function,
        style: suggestedPersona.style,
        prompt: generatePrompt({
          name: suggestedPersona.name,
          function: suggestedPersona.function,
          style: suggestedPersona.style
        })
      };
      
      await createPersona(personaData);
      
      toast({
        title: "Success",
        description: "AI Persona created automatically from email analysis!",
      });
    } catch (error) {
      console.error('Error creating persona automatically:', error);
      toast({
        title: "Error",
        description: "Failed to create persona automatically. Please try creating manually.",
        variant: "destructive"
      });
      // Show the persona creation sheet for manual creation
      setters.setIsPersonaSheetOpen(true);
    }
  };

  const updateExistingPersona = async (suggestedPersona: any) => {
    try {
      if (personas.length === 0) return;
      
      // Get the first persona to update
      const existingPersona = personas[0];
      
      // Update with suggested values
      await updatePersona({
        id: existingPersona.id,
        name: suggestedPersona.name,
        function: suggestedPersona.function,
        style: suggestedPersona.style,
        prompt: generatePrompt({
          name: suggestedPersona.name,
          function: suggestedPersona.function,
          style: suggestedPersona.style
        })
      });
      
      toast({
        title: "Persona Updated",
        description: "AI Persona updated automatically from new email analysis!",
      });
    } catch (error) {
      console.error('Error updating persona:', error);
      toast({
        title: "Update Error", 
        description: "Failed to update persona automatically. Please update manually.",
        variant: "destructive"
      });
      // Show the persona creation sheet for manual editing
      setters.setIsPersonaSheetOpen(true);
    }
  };

  const onPersonaSubmit = async (values: PersonaCreationFormValues) => {
    try {
      // Create persona data from form values
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
      
      toast({
        title: "Success",
        description: "AI Persona created successfully!",
      });
      
      setters.setIsPersonaSheetOpen(false);
      setters.setSuggestedPersona(null);
    } catch (error) {
      console.error('Error creating persona:', error);
      toast({
        title: "Error",
        description: "Failed to create persona. Please try again.",
        variant: "destructive"
      });
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
      toast({
        title: "Analysis Error",
        description: "Failed to retrieve or generate analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAnalyzeNow = async () => {
    try {
      const selectedEmail = setters.setSelectedEmail as unknown as () => EmailMessage | null;
      const emailData = selectedEmail();
      
      if (!emailData) return;
      
      await analyzeEmail({
        emailId: emailData.id,
        emailContent: emailData.body,
      });
      
      const updatedAnalysis = await getEmailAnalysis(emailData.id);
      if (updatedAnalysis) {
        setters.setAnalysisData(updatedAnalysis);
        toast({
          title: "Analysis Complete",
          description: "Email analysis was successful",
        });
      }
      
      // Refresh all analyses to update persona
      await updatePersonaFromAllAnalyses();
    } catch (error) {
      console.error('Error analyzing email:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze email. Please try again.",
        variant: "destructive"
      });
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
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${selectedEmails.length} emails`,
      });
      
      setters.setSelectedEmails([]);
      
      // Update persona from all analyses
      await updatePersonaFromAllAnalyses();
    } catch (error) {
      console.error('Error batch analyzing emails:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze selected emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setters.setIsBatchAnalyzing(false);
    }
  };

  const updatePersonaFromAllAnalyses = async () => {
    try {
      // Fetch all available analyses
      const analysesPromises = emailMessages.map(email => getEmailAnalysis(email.id));
      const analyses = await Promise.all(analysesPromises);
      
      const validAnalyses = analyses.filter(Boolean) as any[];
      
      if (validAnalyses.length > 0) {
        const aggregated = aggregateAnalysisResults(validAnalyses);
        setters.setAggregatedAnalysis(aggregated);
        
        const suggestedPersonaData = generateSuggestedPersona(aggregated);
        setters.setSuggestedPersona(suggestedPersonaData);
        
        // Check if a persona already exists to update
        if (personas.length > 0) {
          await updateExistingPersona(suggestedPersonaData);
        } else {
          await createPersonaAutomatically(suggestedPersonaData);
        }
      }
    } catch (error) {
      console.error('Error updating persona from analyses:', error);
      // Silent error - we don't want to show a toast for this background operation
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
        
        // Check if we should update or create
        if (personas.length > 0) {
          await updateExistingPersona(suggestedPersonaData);
        } else {
          await createPersonaAutomatically(suggestedPersonaData);
        }
        
        setters.setSelectedEmails([]);
      } else {
        toast({
          title: "No Analysis Data",
          description: "Please analyze selected emails first before creating a persona",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating persona from selected emails:', error);
      toast({
        title: "Error",
        description: "Failed to create persona from selected emails. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    onEmailImportSubmit,
    onPersonaSubmit,
    handleViewAnalysis,
    handleAnalyzeNow,
    handleAnalyzeSelected,
    handleCreatePersonaFromSelected,
    updatePersonaFromAllAnalyses,
  };
}
