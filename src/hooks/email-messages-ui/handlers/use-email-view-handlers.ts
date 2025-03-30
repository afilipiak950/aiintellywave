
import { toast } from '@/hooks/use-toast';
import { usePersonas } from '@/hooks/use-personas';
import { EmailMessage } from '@/types/persona';

export function useEmailViewHandlers(setters: {
  setSelectedEmail: (email: EmailMessage | null) => void;
  setAnalysisData: (analysis: any) => void;
  setIsAnalysisDialogOpen: (isOpen: boolean) => void;
}) {
  const { 
    analyzeEmail, 
    getEmailAnalysis 
  } = usePersonas();

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

  const handleAnalyzeNow = async (emailData: EmailMessage | null) => {
    try {
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
    } catch (error) {
      console.error('Error analyzing email:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze email. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    handleViewAnalysis,
    handleAnalyzeNow
  };
}
