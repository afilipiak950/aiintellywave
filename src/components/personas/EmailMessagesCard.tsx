
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { usePersonas } from '@/hooks/use-personas';
import { EmailMessage, EmailAnalysis, AIPersona } from '@/types/persona';
import { Mail, Upload, FileText, Sparkles, AlertCircle, Plus, Minus, ArrowRight, Check, X, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generatePrompt } from '@/utils/persona-utils';
import { predefinedStyles, predefinedFunctions } from '@/utils/persona-utils';

const MAX_EMAIL_BODIES = 100;

// Define the schema for multiple email bodies
const emailImportSchema = z.object({
  emailBodies: z.array(
    z.object({
      body: z.string().min(10, {
        message: 'Email body must be at least 10 characters.',
      }),
    })
  ).min(1, {
    message: 'At least one email body is required.',
  }).max(MAX_EMAIL_BODIES, {
    message: `Maximum of ${MAX_EMAIL_BODIES} emails allowed.`,
  }),
});

type EmailImportFormValues = z.infer<typeof emailImportSchema>;

// Persona creation form schema
const personaCreationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  function: z.string().min(1, { message: 'Please select a function.' }),
  style: z.string().min(1, { message: 'Please select a style.' }),
});

type PersonaCreationFormValues = z.infer<typeof personaCreationSchema>;

export function EmailMessagesCard() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [analysisData, setAnalysisData] = useState<EmailAnalysis | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [aggregatedAnalysis, setAggregatedAnalysis] = useState<any>(null);
  const [isPersonaSheetOpen, setIsPersonaSheetOpen] = useState(false);
  const [suggestedPersona, setSuggestedPersona] = useState<Partial<AIPersona> | null>(null);
  
  const { 
    emailMessages, 
    createEmailMessage, 
    analyzeEmail, 
    isAnalyzing,
    getEmailAnalysis,
    createPersona
  } = usePersonas();

  // Form for importing multiple email bodies
  const emailImportForm = useForm<EmailImportFormValues>({
    resolver: zodResolver(emailImportSchema),
    defaultValues: {
      emailBodies: [{ body: '' }],
    },
  });

  // Setup field array for multiple email bodies
  const { fields, append, remove } = useFieldArray({
    control: emailImportForm.control,
    name: "emailBodies",
  });

  // Form for persona creation
  const personaForm = useForm<PersonaCreationFormValues>({
    resolver: zodResolver(personaCreationSchema),
    defaultValues: {
      name: '',
      function: '',
      style: '',
    },
  });

  const addEmailBody = () => {
    if (fields.length < MAX_EMAIL_BODIES) {
      append({ body: '' });
    }
  };

  const removeEmailBody = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onEmailImportSubmit = async (values: EmailImportFormValues) => {
    try {
      const emailPromises = values.emailBodies.map(async ({ body }) => {
        // Create email message with only body field
        const messageData = { body };
        return await createEmailMessage(messageData);
      });

      // Wait for all emails to be created
      const createdEmails = await Promise.all(emailPromises);
      
      // Close the import dialog
      emailImportForm.reset({ emailBodies: [{ body: '' }] });
      setIsImportDialogOpen(false);
      
      // Analyze all emails
      const analysisPromises = createdEmails.map(email => 
        analyzeEmail({
          emailId: email.id,
          emailContent: email.body,
        })
      );
      
      // Wait for all analyses to complete
      await Promise.all(analysisPromises);
      
      // Fetch all analyses
      const analysesPromises = createdEmails.map(email => getEmailAnalysis(email.id));
      const analyses = await Promise.all(analysesPromises);
      
      // Filter out any null results
      const validAnalyses = analyses.filter(Boolean) as EmailAnalysis[];
      
      if (validAnalyses.length > 0) {
        // Aggregate analysis results
        const aggregated = aggregateAnalysisResults(validAnalyses);
        setAggregatedAnalysis(aggregated);
        
        // Generate suggested persona based on analysis
        const suggestedPersonaData = generateSuggestedPersona(aggregated);
        setSuggestedPersona(suggestedPersonaData);
        
        // Pre-fill the persona form
        personaForm.reset({
          name: suggestedPersonaData.name || '',
          function: suggestedPersonaData.function || '',
          style: suggestedPersonaData.style || '',
        });
        
        // Open the persona creation sheet
        setIsPersonaSheetOpen(true);
      }
    } catch (error) {
      console.error('Error importing emails:', error);
    }
  };

  const aggregateAnalysisResults = (analyses: EmailAnalysis[]): any => {
    // Simple aggregation logic - can be enhanced based on requirements
    const tones: Record<string, number> = {};
    const styles: Record<string, number> = {};
    const metrics = {
      formality: 0,
      persuasiveness: 0,
      clarity: 0
    };
    
    analyses.forEach(analysis => {
      // Aggregate tones
      if (analysis.tone_analysis?.primary) {
        tones[analysis.tone_analysis.primary] = (tones[analysis.tone_analysis.primary] || 0) + 1;
      }
      
      // Aggregate styles
      if (analysis.style_metrics?.style?.primary) {
        styles[analysis.style_metrics.style.primary] = (styles[analysis.style_metrics.style.primary] || 0) + 1;
      }
      
      // Aggregate metrics
      if (analysis.style_metrics?.metrics) {
        metrics.formality += analysis.style_metrics.metrics.formality || 0;
        metrics.persuasiveness += analysis.style_metrics.metrics.persuasiveness || 0;
        metrics.clarity += analysis.style_metrics.metrics.clarity || 0;
      }
    });
    
    // Calculate averages for metrics
    const count = analyses.length;
    metrics.formality = metrics.formality / count;
    metrics.persuasiveness = metrics.persuasiveness / count;
    metrics.clarity = metrics.clarity / count;
    
    // Find dominant tone and style
    const dominantTone = Object.entries(tones).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral';
    const dominantStyle = Object.entries(styles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Casual';
    
    return {
      dominantTone,
      dominantStyle,
      metrics,
      allTones: tones,
      allStyles: styles,
      analysisCount: count,
    };
  };

  const generateSuggestedPersona = (aggregatedAnalysis: any): Partial<AIPersona> => {
    // Map the dominant style to a predefined style option
    const matchedStyle = predefinedStyles.find(style => 
      style.name.toLowerCase().includes(aggregatedAnalysis.dominantStyle.toLowerCase()) ||
      style.tone.toLowerCase().includes(aggregatedAnalysis.dominantStyle.toLowerCase())
    )?.id || 'professional';
    
    // Select a function based on analysis or default to 'follow-up'
    const suggestedFunction = 'follow-up'; // Default function
    
    // Generate a name based on style
    const namePrefix = aggregatedAnalysis.metrics.formality > 7 ? 'Professional' : 
                      aggregatedAnalysis.metrics.formality > 4 ? 'Balanced' : 'Casual';
    
    const persona: Partial<AIPersona> = {
      name: `${namePrefix} ${aggregatedAnalysis.dominantTone} Communicator`,
      style: matchedStyle,
      function: suggestedFunction,
      // Generate prompt based on the analysis
      prompt: `Act as a professional communicator with a ${aggregatedAnalysis.dominantTone.toLowerCase()} tone.
Your communication should be ${aggregatedAnalysis.dominantStyle.toLowerCase()} in style, with a formality level of ${Math.round(aggregatedAnalysis.metrics.formality)}/10.
Focus on being clear (${Math.round(aggregatedAnalysis.metrics.clarity)}/10) and persuasive (${Math.round(aggregatedAnalysis.metrics.persuasiveness)}/10).
Adapt to the recipient's needs while maintaining consistency in tone and style.`,
    };
    
    return persona;
  };

  const onPersonaSubmit = async (values: PersonaCreationFormValues) => {
    try {
      if (!suggestedPersona) return;
      
      // Combine form values with suggested persona data
      const personaData: Omit<AIPersona, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        ...values,
        prompt: generatePrompt({
          name: values.name,
          function: values.function,
          style: values.style
        })
      };
      
      // Create the persona
      await createPersona(personaData);
      
      // Reset and close
      personaForm.reset();
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
        // No analysis yet, trigger one
        await analyzeEmail({
          emailId: email.id,
          emailContent: email.body,
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
                  <p className="font-medium truncate">
                    {message.body.substring(0, 50)}...
                  </p>
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Email Content</DialogTitle>
            <DialogDescription>
              Paste one or more email bodies for AI analysis and persona matching
            </DialogDescription>
          </DialogHeader>
          <Form {...emailImportForm}>
            <form onSubmit={emailImportForm.handleSubmit(onEmailImportSubmit)} className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <FormLabel className="font-medium">Email Body #{index + 1}</FormLabel>
                        {fields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeEmailBody(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormField
                        control={emailImportForm.control}
                        name={`emailBodies.${index}.body`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Paste email content here" 
                                className="h-32 font-mono text-sm"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-muted-foreground">
                  {fields.length} of {MAX_EMAIL_BODIES} email bodies
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEmailBody}
                  disabled={fields.length >= MAX_EMAIL_BODIES}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Email
                </Button>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAnalyzing}>
                  {isAnalyzing ? 'Processing...' : 'Import & Analyze'}
                </Button>
              </div>
            </form>
          </Form>
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
                  <Button 
                    onClick={() => {
                      if (selectedEmail) {
                        analyzeEmail({
                          emailId: selectedEmail.id,
                          emailContent: selectedEmail.body,
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
      
      {/* Persona Creation Sheet */}
      <Sheet open={isPersonaSheetOpen} onOpenChange={setIsPersonaSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Create KI Persona from Analysis</SheetTitle>
            <SheetDescription>
              Create a new persona based on the analysis of {aggregatedAnalysis?.analysisCount || 0} emails
            </SheetDescription>
          </SheetHeader>
          
          {aggregatedAnalysis && (
            <div className="mt-6">
              <div className="bg-primary/10 p-4 rounded-md mb-6">
                <h3 className="font-semibold text-primary mb-2">Analysis Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Dominant Tone:</span>
                    <span className="font-medium">{aggregatedAnalysis.dominantTone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Writing Style:</span>
                    <span className="font-medium">{aggregatedAnalysis.dominantStyle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Formality:</span>
                    <span className="font-medium">{Math.round(aggregatedAnalysis.metrics.formality)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Persuasiveness:</span>
                    <span className="font-medium">{Math.round(aggregatedAnalysis.metrics.persuasiveness)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clarity:</span>
                    <span className="font-medium">{Math.round(aggregatedAnalysis.metrics.clarity)}/10</span>
                  </div>
                </div>
              </div>
              
              <Form {...personaForm}>
                <form onSubmit={personaForm.handleSubmit(onPersonaSubmit)} className="space-y-4">
                  <FormField
                    control={personaForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona Name</FormLabel>
                        <FormControl>
                          <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personaForm.control}
                    name="function"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Function</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="" disabled>Select a function</option>
                            {predefinedFunctions.map((func) => (
                              <option key={func.id} value={func.id}>
                                {func.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personaForm.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Style</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="" disabled>Select a style</option>
                            {predefinedStyles.map((style) => (
                              <option key={style.id} value={style.id}>
                                {style.name} - {style.tone}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <SheetFooter className="pt-6">
                    <Button type="submit" className="w-full">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Create Persona
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
