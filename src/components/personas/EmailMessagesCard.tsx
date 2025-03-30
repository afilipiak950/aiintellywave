
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet } from "@/components/ui/sheet";
import { FileText, Plus, Sparkles, RefreshCw, UserCircle } from 'lucide-react';
import { EmailImportForm } from './EmailImportForm';
import { EmailAnalysisDialog } from './EmailAnalysisDialog';
import { PersonaCreationSheet } from './PersonaCreationSheet';
import { useEmailMessagesUI } from '@/hooks/use-email-messages-ui';
import { SelectedEmailsToolbar } from './email/SelectedEmailsToolbar';
import { EmailMessagesList } from './email/EmailMessagesList';

export function EmailMessagesCard() {
  const {
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
    
    onEmailImportSubmit,
    onPersonaSubmit,
    handleViewAnalysis,
    handleAnalyzeNow,
    handleAnalyzeSelected,
    handleCreatePersonaFromSelected,
    toggleSelectEmail,
    handleToggleExpand,
    updatePersonaFromAllAnalyses
  } = useEmailMessagesUI();

  // Handler for the "Create Persona" button that will analyze all emails and create/update persona
  const handleCreatePersonaFromAll = async () => {
    if (emailMessages.length === 0) return;
    
    console.log('Creating persona from all emails:', emailMessages.length);
    
    // First analyze all emails
    await handleAnalyzeSelected(emailMessages.map(email => email.id));
    
    // Then create/update persona based on all analyses
    await updatePersonaFromAllAnalyses();
  };

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
        {emailMessages.length > 0 && (
          <SelectedEmailsToolbar
            selectedCount={selectedEmails.length}
            isBatchAnalyzing={isBatchAnalyzing}
            handleAnalyzeSelected={handleAnalyzeSelected}
            handleCreatePersonaFromSelected={handleCreatePersonaFromSelected}
          />
        )}
        
        <EmailMessagesList
          displayedEmails={displayedEmails}
          selectedEmails={selectedEmails}
          isEmailListExpanded={isEmailListExpanded}
          toggleSelectEmail={toggleSelectEmail}
          handleViewAnalysis={handleViewAnalysis}
          handleToggleExpand={handleToggleExpand}
          emailMessages={emailMessages}
        />
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
            onClick={handleCreatePersonaFromAll}
            disabled={isBatchAnalyzing || isAnalyzing}
          >
            {isBatchAnalyzing || isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserCircle className="h-4 w-4 mr-2" />
            )}
            Create Persona
          </Button>
        )}
      </CardFooter>
      
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
