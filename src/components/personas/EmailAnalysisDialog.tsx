
import { format } from 'date-fns';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EmailMessage, EmailAnalysis } from '@/types/persona';
import { Sparkles, AlertCircle } from 'lucide-react';

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
        <div className="bg-muted p-3 rounded-md">
          <div className="text-xs text-muted-foreground">
            Created: {selectedEmail.created_at ? format(new Date(selectedEmail.created_at), 'MMM d, yyyy') : 'Date unknown'}
          </div>
          <div className="mt-2 text-sm">
            {selectedEmail.body.length > 200 
              ? selectedEmail.body.substring(0, 200) + '...' 
              : selectedEmail.body}
          </div>
        </div>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
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
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-primary/10">
                          {analysisData.tone_analysis.primary}
                        </Badge>
                        {analysisData.tone_analysis.secondary && (
                          <Badge variant="outline">
                            {analysisData.tone_analysis.secondary}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mt-2">{analysisData.tone_analysis.description}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="style">
                <AccordionTrigger>Style & Language</AccordionTrigger>
                <AccordionContent>
                  {analysisData.style_metrics && analysisData.style_metrics.style && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Writing Style</h4>
                        <Badge variant="outline" className="bg-primary/10">
                          {analysisData.style_metrics.style.primary}
                        </Badge>
                        <div className="mt-2">
                          <ul className="list-disc ml-5 text-sm">
                            {analysisData.style_metrics.style.characteristics?.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {analysisData.style_metrics.language && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Language</h4>
                          <Badge variant="outline">
                            {analysisData.style_metrics.language.level}
                          </Badge>
                          <div className="mt-2">
                            <ul className="list-disc ml-5 text-sm">
                              {analysisData.style_metrics.language.features?.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
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
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Formality</span>
                            <span className="font-medium">{analysisData.style_metrics.metrics.formality}/10</span>
                          </div>
                          <Progress value={analysisData.style_metrics.metrics.formality * 10} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Persuasiveness</span>
                            <span className="font-medium">{analysisData.style_metrics.metrics.persuasiveness}/10</span>
                          </div>
                          <Progress value={analysisData.style_metrics.metrics.persuasiveness * 10} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Clarity</span>
                            <span className="font-medium">{analysisData.style_metrics.metrics.clarity}/10</span>
                          </div>
                          <Progress value={analysisData.style_metrics.metrics.clarity * 10} />
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
