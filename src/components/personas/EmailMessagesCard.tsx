
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { usePersonas } from '@/hooks/use-personas';
import { EmailMessage, EmailAnalysis, AIPersona } from '@/types/persona';
import { FileText, Mail, Plus, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { EmailImportForm, EmailImportFormValues } from './EmailImportForm';
import { EmailAnalysisDialog } from './EmailAnalysisDialog';
import { PersonaCreationSheet, PersonaCreationFormValues } from './PersonaCreationSheet';
import { aggregateAnalysisResults, generateSuggestedPersona } from '@/utils/email-analysis-utils';
import { generatePrompt } from '@/utils/persona-utils';

export function EmailMessagesCard() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [analysisData, setAnalysisData] = useState<EmailAnalysis | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [aggregatedAnalysis, setAggregatedAnalysis] = useState<any>(null);
  const [isPersonaSheetOpen, setIsPersonaSheetOpen] = useState(false);
  const [suggestedPersona, setSuggestedPersona] = useState<Partial<AIPersona> | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isEmailListExpanded, setIsEmailListExpanded] = useState(false);
  
  const { 
    emailMessages, 
    createEmailMessage, 
    analyzeEmail, 
    isAnalyzing,
    getEmailAnalysis,
    createPersona,
    batchAnalyzeEmails,
    isBatchAnalyzing
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
      await batchAnalyzeEmails({ emailIds: selectedEmails });
      setSelectedEmails([]);
    } catch (error) {
      console.error('Error batch analyzing emails:', error);
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

  return (
    <Card className="h-full border-t-4 border-t-primary/70 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-background to-muted/30 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Email Content Analysis
        </CardTitle>
        <CardDescription>
          Import and analyze email content to match your personas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {emailMessages.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">
                  {selectedEmails.length} selected
                </span>
              </div>
              
              {selectedEmails.length > 0 && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={handleAnalyzeSelected}
                    disabled={isBatchAnalyzing}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Analyze Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={handleCreatePersonaFromSelected}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Create Persona
                  </Button>
                </div>
              )}
            </div>
            
            {displayedEmails.map((message) => (
              <div 
                key={message.id} 
                className="flex items-start gap-2 p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
              >
                <Checkbox
                  checked={selectedEmails.includes(message.id)}
                  onCheckedChange={() => toggleSelectEmail(message.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      {message.sender && (
                        <span className="font-medium mr-2">From: {message.sender}</span>
                      )}
                      {message.created_at && (
                        <span>{format(new Date(message.created_at), 'MMM d, yyyy')}</span>
                      )}
                    </p>
                  </div>
                  
                  {message.subject && (
                    <p className="font-medium truncate mb-1">{message.subject}</p>
                  )}
                  
                  <p className="text-sm line-clamp-2">
                    {message.body.substring(0, 150)}...
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="shrink-0 ml-2 flex items-center gap-1 hover:bg-background/50"
                  onClick={() => handleViewAnalysis(message)}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">Analysis</span>
                </Button>
              </div>
            ))}
            
            {emailMessages.length > 5 && (
              <Button
                variant="ghost" 
                size="sm" 
                className="w-full text-center text-xs text-muted-foreground"
                onClick={handleToggleExpand}
              >
                {isEmailListExpanded ? (
                  <>Show Less</>
                ) : (
                  <>Show {emailMessages.length - 5} More</>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-md bg-muted/20 animate-pulse">
            <Mail className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No email content imported yet</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/10 flex gap-2">
        <Button 
          className="flex-1 bg-primary/90 hover:bg-primary" 
          onClick={() => setIsImportDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Import Email Content
        </Button>
        
        {emailMessages.length > 0 && (
          <Button 
            variant="outline"
            className="flex-1"
            onClick={handleAnalyzeSelected}
            disabled={selectedEmails.length === 0 || isBatchAnalyzing}
          >
            {isBatchAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Analyze All
          </Button>
        )}
      </CardFooter>
      
      {/* Dialog for email import form */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Email Content</DialogTitle>
          </DialogHeader>
          <EmailImportForm 
            onSubmit={onEmailImportSubmit} 
            isProcessing={isAnalyzing} 
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <EmailAnalysisDialog 
          selectedEmail={selectedEmail}
          analysisData={analysisData}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyzeNow}
          onClose={() => setIsAnalysisDialogOpen(false)}
        />
      </Dialog>
      
      <Sheet open={isPersonaSheetOpen} onOpenChange={setIsPersonaSheetOpen}>
        <PersonaCreationSheet 
          isOpen={isPersonaSheetOpen}
          onOpenChange={setIsPersonaSheetOpen}
          aggregatedAnalysis={aggregatedAnalysis}
          suggestedPersona={suggestedPersona}
          onSubmit={onPersonaSubmit}
        />
      </Sheet>
    </Card>
  );
}
