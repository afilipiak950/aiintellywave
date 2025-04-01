
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { runGmailDiagnostic } from '@/services/email-integration-provider-service';

const providerFormSchema = z.object({
  provider: z.enum(['gmail', 'outlook', 'linkedin', 'other']),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

export type ProviderFormValues = z.infer<typeof providerFormSchema>;

interface EmailProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualSubmit: (values: ProviderFormValues) => void;
  onOAuthConnect: (provider: 'gmail' | 'outlook') => void;
  isLoading: boolean;
  loadingProvider: string | null;
}

export function EmailProviderDialog({
  open,
  onOpenChange,
  onManualSubmit,
  onOAuthConnect,
  isLoading,
  loadingProvider,
}: EmailProviderDialogProps) {
  const providerForm = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      provider: 'gmail',
      email: '',
    },
  });

  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);

  const runDiagnostic = async () => {
    try {
      setDiagnosisLoading(true);
      const result = await runGmailDiagnostic();
      setDiagnosisResult(result?.diagnostic || null);
    } catch (error) {
      console.error('Failed to run diagnostic:', error);
    } finally {
      setDiagnosisLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  onClick={() => onOAuthConnect('gmail')}
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
                  onClick={() => onOAuthConnect('outlook')}
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

              <div className="pt-2 border-t mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runDiagnostic}
                  disabled={diagnosisLoading}
                  className="w-full"
                >
                  {diagnosisLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running connection diagnostic...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Run Connection Diagnostic
                    </>
                  )}
                </Button>
              </div>
              
              {diagnosisResult && (
                <div className="mt-4 space-y-4 text-xs">
                  <Alert variant="default" className="py-2">
                    <AlertTitle className="text-xs font-semibold">Diagnostic Results</AlertTitle>
                    <AlertDescription className="text-xs">
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="font-medium">Environment Variables:</p>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            <li>Client ID: {diagnosisResult.environment.envVars.clientIdSet ? 
                              (`✅ Set (${diagnosisResult.environment.envVars.clientIdPrefix}, matches expected: ${diagnosisResult.environment.envVars.clientIdMatch ? 'Yes' : 'No'})`) : 
                              '❌ Missing'}</li>
                            <li>Client Secret: {diagnosisResult.environment.envVars.clientSecretSet ? 
                              (`✅ Set (${diagnosisResult.environment.envVars.clientSecretPrefix}, matches expected: ${diagnosisResult.environment.envVars.clientSecretMatch ? 'Yes' : 'No'})`) : 
                              '❌ Missing'}</li>
                            <li>Redirect URI: {diagnosisResult.redirect_uri || 
                              (diagnosisResult.environment.envVars.redirectUri !== 'not set' ? 
                               diagnosisResult.environment.envVars.redirectUri : 
                               '❌ Not set')}</li>
                          </ul>
                        </div>
                        
                        <div>
                          <p className="font-medium">Connectivity Tests:</p>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            {Object.entries(diagnosisResult.connectivity).map(([domain, info]: [string, any]) => (
                              <li key={domain}>
                                {domain}: {info.success ? '✅ Connected' : `❌ Failed: ${info.error}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {diagnosisResult.authUrlError && (
                          <div>
                            <p className="font-medium text-red-500">Auth URL Error:</p>
                            <p className="ml-2 mt-1">{diagnosisResult.authUrlError}</p>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="pt-4">
            <Form {...providerForm}>
              <form onSubmit={providerForm.handleSubmit(onManualSubmit)} className="space-y-4">
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
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit">
                    Vorübergehend verbinden
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
