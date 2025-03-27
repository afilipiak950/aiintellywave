
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePersonas } from '@/hooks/use-personas';
import { EmailMessage, EmailAnalysis } from '@/types/persona';
import { Mail, Upload, FileText, Sparkles, AlertCircle, Plus, ArrowRight, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const emailMessageSchema = z.object({
  subject: z.string().optional(),
  body: z.string().min(10, {
    message: 'Email body must be at least 10 characters.',
  }),
  sender: z.string().optional(),
  recipient: z.string().optional(),
});

type EmailMessageFormValues = z.infer<typeof emailMessageSchema>;

export function EmailMessagesCard() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [analysisData, setAnalysisData] = useState<EmailAnalysis | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  
  const { 
    emailMessages, 
    createEmailMessage, 
    analyzeEmail, 
    isAnalyzing,
    getEmailAnalysis
  } = usePersonas();

  const emailForm = useForm<EmailMessageFormValues>({
    resolver: zodResolver(emailMessageSchema),
    defaultValues: {
      subject: '',
      body: '',
      sender: '',
      recipient: '',
    },
  });

  const onEmailSubmit = async (values: EmailMessageFormValues) => {
    try {
      const newEmail = await createEmailMessage({
        ...values,
      });
      
      emailForm.reset();
      setIsImportDialogOpen(false);
      
      // Automatically trigger analysis
      analyzeEmail({
        emailId: newEmail.id,
        emailContent: values.body,
        emailSubject: values.subject,
      });
      
    } catch (error) {
      console.error('Error importing email:', error);
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
        // No analysis yet, trigger one
        analyzeEmail({
          emailId: email.id,
          emailContent: email.body,
          emailSubject: email.subject,
        });
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Email Content Analysis
        </CardTitle>
        <CardDescription>
          Import and analyze email content to match your personas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailMessages.length > 0 ? (
          <div className="space-y-3">
            {emailMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{message.subject || 'No subject'}</p>
                  <p className="text-xs text-muted-foreground">
                    {message.created_at ? format(new Date(message.created_at), 'MMM d, yyyy') : 'Date unknown'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 flex items-center gap-1"
                  onClick={() => handleViewAnalysis(message)}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Analysis</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-md bg-muted/50">
            <Mail className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No email content imported yet</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => setIsImportDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Import Email Content
        </Button>
      </CardFooter>
      
      {/* Email Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Email Content</DialogTitle>
            <DialogDescription>
              Paste your email content for AI analysis and persona matching
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="paste">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">Paste Email</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="py-4">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Email subject line" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emailForm.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Body</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste full email content here" 
                            className="h-60 font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="sender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Sender email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="recipient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Recipient email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Import & Analyze</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="upload" className="py-4">
              <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-md">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center font-medium mb-2">Drag & drop or click to upload</p>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Supports .eml, .txt, or .msg files with email content
                </p>
                <Button>Upload Email</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Analysis Dialog */}
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Analysis</DialogTitle>
            <DialogDescription>
              AI-powered analysis of your email content
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <h3 className="font-semibold">{selectedEmail.subject || 'No subject'}</h3>
                <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                  {selectedEmail.sender && <span>From: {selectedEmail.sender}</span>}
                  {selectedEmail.recipient && <span>To: {selectedEmail.recipient}</span>}
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
                  <Button 
                    onClick={() => {
                      if (selectedEmail) {
                        analyzeEmail({
                          emailId: selectedEmail.id,
                          emailContent: selectedEmail.body,
                          emailSubject: selectedEmail.subject,
                        });
                      }
                    }}
                    className="mt-4"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
