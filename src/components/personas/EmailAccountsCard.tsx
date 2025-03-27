
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePersonas } from '@/hooks/use-personas';
import { authorizeGmail, authorizeOutlook } from '@/services/email-integration-provider-service';
import { EmailIntegration } from '@/types/persona';
import { Mail, CheckCircle2, AlertCircle, Loader2, Send, Trash2, ShieldCheck, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const providerFormSchema = z.object({
  provider: z.enum(['gmail', 'outlook', 'linkedin', 'other']),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

type ProviderFormValues = z.infer<typeof providerFormSchema>;

export function EmailAccountsCard() {
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [configErrorDialogOpen, setConfigErrorDialogOpen] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { emailIntegrations, createEmailIntegration, deleteEmailIntegration, isLoadingIntegrations } = usePersonas();

  const providerForm = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      provider: 'gmail',
      email: '',
    },
  });

  const onProviderSubmit = (values: ProviderFormValues) => {
    startTransition(() => {
      createEmailIntegration({
        provider: values.provider,
        email: values.email,
      });
      setIsProviderDialogOpen(false);
      providerForm.reset();
    });
  };

  const handleOAuthConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      setIsLoading(true);
      setLoadingProvider(provider);
      let authUrl;
      
      console.log(`Initiating ${provider} OAuth flow`);
      
      if (provider === 'gmail') {
        authUrl = await authorizeGmail();
      } else {
        authUrl = await authorizeOutlook();
      }
      
      if (!authUrl) {
        throw new Error(`Failed to get authorization URL from ${provider} service`);
      }
      
      console.log(`Got ${provider} auth URL:`, authUrl);
      
      // Add state parameter to track provider
      const stateParam = authUrl.includes('?') ? `&state=${provider}` : `?state=${provider}`;
      window.location.href = authUrl + stateParam;
    } catch (error: any) {
      console.error(`Error connecting to ${provider}:`, error);
      
      // Check for specific error messages
      const errorMessage = error.message || '';
      
      // Check if it's likely a configuration issue
      const isConfigError = 
        errorMessage.includes('environment variable') || 
        errorMessage.includes('not set') || 
        errorMessage.includes('Missing') ||
        errorMessage.includes('Invalid response') ||
        errorMessage.includes('non-2xx status code');
      
      if (isConfigError) {
        setConfigError(`The ${provider.charAt(0).toUpperCase() + provider.slice(1)} integration is not properly configured. 
        The server administrator needs to set up the required API credentials. ${errorMessage}`);
        setConfigErrorDialogOpen(true);
      } else {
        toast({
          title: 'Connection Error',
          description: `Failed to connect to ${provider}: ${errorMessage}`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleImportEmails = async (integration: EmailIntegration) => {
    try {
      // For now, we'll just show a toast since the function isn't implemented yet
      toast({
        title: 'Import Feature',
        description: `Email import will be implemented soon.`,
      });
    } catch (error: any) {
      console.error('Error importing emails:', error);
      toast({
        title: 'Import Error',
        description: `Failed to import emails: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = (integration: EmailIntegration) => {
    deleteEmailIntegration(integration.id);
  };

  return (
    <Card className="h-full border-t-4 border-t-primary/70 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-background to-muted/30 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Temporary Email Connections
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span className="text-xs">Privacy Protected</span>
          </Badge>
        </div>
        <CardDescription>
          Connect your email temporarily to analyze writing style for AI personas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoadingIntegrations ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : emailIntegrations.length > 0 ? (
          <div className="space-y-3">
            {emailIntegrations.map((integration) => (
              <div 
                key={integration.id} 
                className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{integration.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {integration.provider}
                      <span className="ml-2 text-primary">• Temporary Access</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-background/50"
                    onClick={() => handleImportEmails(integration)}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => handleDisconnect(integration)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-md bg-muted/20 animate-pulse">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No temporary email connections</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/10">
        <Button className="w-full bg-primary/90 hover:bg-primary" onClick={() => setIsProviderDialogOpen(true)}>
          Connect Email Temporarily
        </Button>
      </CardFooter>

      {/* OAuth Provider Dialog */}
      <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Temporary Email Connection</DialogTitle>
            <DialogDescription>
              Connect your email account to analyze your writing style for AI persona creation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-primary/5 p-3 rounded-md mb-4 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Privacy Notice</p>
                <p>This is a one-time, temporary connection to analyze your writing style. We'll only access up to 100 recent emails to create your AI persona. You can disconnect at any time.</p>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="oauth" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="oauth">OAuth Connect</TabsTrigger>
              <TabsTrigger value="manual">Manual Connect</TabsTrigger>
            </TabsList>
            
            <TabsContent value="oauth" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    className="w-full flex items-center justify-center gap-2 h-12 bg-red-500 hover:bg-red-600"
                    onClick={() => handleOAuthConnect('gmail')}
                    disabled={isLoading}
                  >
                    {isLoading && loadingProvider === 'gmail' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current">
                        <path d="M22.288 12.016c0-.734-.065-1.44-.186-2.118H12v4.008h5.782a4.94 4.94 0 0 1-2.142 3.243v2.694h3.47c2.033-1.87 3.178-4.624 3.178-7.827Z" fill="#4285F4"/>
                        <path d="M12 23.001c2.898 0 5.334-1.04 7.11-2.164l-3.47-2.693c-.96.64-2.186 1.017-3.64 1.017-2.798 0-5.172-1.887-6.022-4.42H2.408v2.782c1.86 3.691 5.653 5.479 9.592 5.479Z" fill="#34A853"/>
                        <path d="M5.978 14.742a6.626 6.626 0 0 1-.348-2.102c0-.73.128-1.44.348-2.104v-2.78H2.41a11.017 11.017 0 0 0 0 9.765l3.568-2.779Z" fill="#FBBC05"/>
                        <path d="M12 5.424c1.576 0 2.988.54 4.104 1.601l3.078-3.079C17.383 2.275 14.945 1 12 1 8.062 1 4.268 2.79 2.409 6.48l3.568 2.779c.85-2.534 3.224-4.42 6.022-4.42Z" fill="#EA4335"/>
                      </svg>
                    )}
                    <span>Connect with Gmail</span>
                  </Button>
                  
                  <Button 
                    className="w-full flex items-center justify-center gap-2 h-12 bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleOAuthConnect('outlook')}
                    disabled={isLoading}
                  >
                    {isLoading && loadingProvider === 'outlook' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current">
                        <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.85.2t-.85-.2q-.36-.19-.59-.52-.22-.34-.33-.74-.1-.42-.1-.87t.1-.87q.1-.41.33-.74.23-.33.59-.52.36-.2.85-.2t.85.2q.36.19.58.52.23.34.33.74.11.42.11.87Zm4.12 2.35v-4.7h1.16l2.86 3.57v-3.57h1.16v4.7h-1.16l-2.86-3.57v3.57h-1.16Zm7.12-3.35q.33.44.5 1.01.17.58.17 1.18 0 .64-.18 1.18-.17.54-.49.93-.33.4-.77.6-.44.21-.95.21-.63 0-1.11-.22-.48-.21-.81-.6v.74h-1.09v-6.97h1.09v2.58q.32-.4.8-.62.5-.22 1.11-.22.5 0 .95.2.44.21.78.6Z" fill="#00a2ed"/>
                        <path d="M2 3h20c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2Zm2 16h16V5H4v14Zm18-7-8 3.5-8-3.5V9l8 3.5L22 9v3Z" fill="#00a2ed"/>
                      </svg>
                    )}
                    <span>Connect with Outlook</span>
                  </Button>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>Connect your email account to analyze your writing style for AI persona creation.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="pt-4">
              <Form {...providerForm}>
                <form onSubmit={providerForm.handleSubmit(onProviderSubmit)} className="space-y-4">
                  <FormField
                    control={providerForm.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Provider</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gmail">Gmail</SelectItem>
                            <SelectItem value="outlook">Outlook</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={providerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsProviderDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Connect Temporarily</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Configuration Error Dialog */}
      <Dialog open={configErrorDialogOpen} onOpenChange={setConfigErrorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Configuration Error
            </DialogTitle>
          </DialogHeader>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing API Configuration</AlertTitle>
            <AlertDescription>
              {configError}
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-4 rounded-md text-sm mt-2">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">For System Administrators</p>
                <p>Please ensure the following environment variables are configured in the Supabase Edge Functions:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>OUTLOOK_CLIENT_ID</li>
                  <li>OUTLOOK_CLIENT_SECRET</li>
                  <li>REDIRECT_URI</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setConfigErrorDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
