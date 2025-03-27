
import { format } from 'date-fns';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EmailMessage, EmailAnalysis } from '@/types/persona';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface EmailAnalysisDialogProps {
  selectedEmail: EmailMessage | null;
  analysisData: EmailAnalysis | null;
  isAnalyzing: boolean;
  onAnalyze: () => Promise<void>;
  onClose: () => void;
}

export function EmailAnalysisDialog({ 
  selectedEmail, 
  analysisData, 
  isAnalyzing, 
  onAnalyze, 
  onClose 
}: EmailAnalysisDialogProps) {
  if (!selectedEmail) return null;

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Email Analysis</DialogTitle>
        <DialogDescription>
          AI-powered analysis of your email content
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="bg-muted p-3 rounded-md space-y-2">
          {selectedEmail.subject && (
            <div className="font-medium">{selectedEmail.subject}</div>
          )}
          
          <div className="text-xs space-y-1">
            {selectedEmail.sender && (
              <div><span className="font-medium">From:</span> {selectedEmail.sender}</div>
            )}
            {selectedEmail.recipient && (
              <div><span className="font-medium">To:</span> {selectedEmail.recipient}</div>
            )}
            <div>
              <span className="font-medium">Date:</span> {
                selectedEmail.received_date 
                  ? format(new Date(selectedEmail.received_date), 'MMM d, yyyy HH:mm')
                  : selectedEmail.created_at 
                    ? format(new Date(selectedEmail.created_at), 'MMM d, yyyy HH:mm') 
                    : 'Date unknown'
              }
            </div>
          </div>
          
          <div className="mt-3 text-sm border-t pt-2 max-h-60 overflow-y-auto">
            {selectedEmail.body}
          </div>
        </div>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-center font-medium">Analyzing email content...</p>
            <Progress value={45} className="w-2/3" />
          </div>
        ) : analysisData ? (
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-md">
              <h3 className="font-semibold text-primary mb-2">Summary</h3>
              <p>{analysisData.summary}</p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="tone">
                <AccordionTrigger>Tone Analysis</AccordionTrigger>
                <AccordionContent>
                  {analysisData.tone_analysis && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium mb-1">Primary Tone</span>
                          <Badge variant="outline" className="bg-primary/10 inline-flex">
                            {analysisData.tone_analysis.primary}
                          </Badge>
                        </div>
                        
                        {analysisData.tone_analysis.secondary && (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium mb-1">Secondary Tone</span>
                            <Badge variant="outline" className="inline-flex">
                              {analysisData.tone_analysis.secondary}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {analysisData.tone_analysis.description && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-sm">{analysisData.tone_analysis.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="style">
                <AccordionTrigger>Style & Language</AccordionTrigger>
                <AccordionContent>
                  {analysisData.style_metrics && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Writing Style</h4>
                        <Badge variant="outline" className="bg-primary/10">
                          {analysisData.style_metrics.style?.primary || 'Not specified'}
                        </Badge>
                        
                        {analysisData.style_metrics.style?.characteristics && (
                          <div className="mt-2">
                            <h5 className="text-xs font-medium mb-1">Characteristics</h5>
                            <ul className="list-disc ml-5 text-sm">
                              {analysisData.style_metrics.style.characteristics.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {analysisData.style_metrics.language && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Language</h4>
                          <Badge variant="outline">
                            {analysisData.style_metrics.language.level || 'Not specified'}
                          </Badge>
                          
                          {analysisData.style_metrics.language.features && (
                            <div className="mt-2">
                              <h5 className="text-xs font-medium mb-1">Features</h5>
                              <ul className="list-disc ml-5 text-sm">
                                {analysisData.style_metrics.language.features.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="metrics">
                <AccordionTrigger>Communication Metrics</AccordionTrigger>
                <AccordionContent>
                  {analysisData.style_metrics && analysisData.style_metrics.metrics && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Formality</span>
                            <span className="font-medium">{analysisData.style_metrics.metrics.formality}/10</span>
                          </div>
                          <Progress value={analysisData.style_metrics.metrics.formality * 10} />
                          <p className="text-xs text-muted-foreground">
                            How formal the language and tone appears
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Persuasiveness</span>
                            <span className="font-medium">{analysisData.style_metrics.metrics.persuasiveness}/10</span>
                          </div>
                          <Progress value={analysisData.style_metrics.metrics.persuasiveness * 10} />
                          <p className="text-xs text-muted-foreground">
                            How convincing and persuasive the content is
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Clarity</span>
                            <span className="font-medium">{analysisData.style_metrics.metrics.clarity}/10</span>
                          </div>
                          <Progress value={analysisData.style_metrics.metrics.clarity * 10} />
                          <p className="text-xs text-muted-foreground">
                            How clear and easy to understand the message is
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-center">No analysis available yet. Click analyze to generate insights.</p>
            <Button onClick={onAnalyze} className="mt-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Now
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
