
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormField } from '@/components/ui/form';
import { Mail, Lock, RefreshCw } from 'lucide-react';
import { useEmailSMTPIntegration } from '@/hooks/email-integration/use-email-smtp-integration';
import { useToast } from '@/hooks/use-toast';

interface EmailFormValues {
  email: string;
  smtpServer: string;
  smtpPort: string;
  imapServer: string;
  imapPort: string;
  password: string;
}

const EmailIntegrationTab = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { toast } = useToast();
  
  const {
    username,
    setUsername,
    password,
    setPassword,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    imapHost,
    setImapHost,
    imapPort,
    setImapPort,
    existingIntegration,
    handleSubmit,
    handleTestConnection,
    isLoading,
    refreshIntegrations
  } = useEmailSMTPIntegration();
  
  const form = useForm<EmailFormValues>({
    defaultValues: {
      email: username || '',
      smtpServer: smtpHost || '',
      smtpPort: smtpPort || '587',
      imapServer: imapHost || '',
      imapPort: imapPort || '993',
      password: ''
    }
  });
  
  // Update form values when integration data changes
  useEffect(() => {
    console.log("Updating form with values:", {
      email: username,
      smtpServer: smtpHost,
      smtpPort,
      imapServer: imapHost,
      imapPort,
    });
    
    form.reset({
      email: username || '',
      smtpServer: smtpHost || '',
      smtpPort: smtpPort || '587',
      imapServer: imapHost || '',
      imapPort: imapPort || '993',
      password: password || ''
    });
  }, [username, smtpHost, smtpPort, imapHost, imapPort, password, form]);

  // Refresh integrations data when component mounts
  useEffect(() => {
    refreshIntegrations();
  }, [refreshIntegrations]);

  const onSubmit = async (data: EmailFormValues) => {
    setIsSubmitting(true);
    setIsEncrypting(true);
    
    try {
      console.log("Submitting email configuration:", {
        ...data,
        password: "***REDACTED***"
      });
      
      // Update state values from form
      setUsername(data.email);
      setPassword(data.password);
      setSmtpHost(data.smtpServer);
      setSmtpPort(data.smtpPort);
      setImapHost(data.imapServer);
      setImapPort(data.imapPort);
      
      // Wait for encryption animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Submit using the hook's handler
      await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      
      // Ensure we get the latest data
      await refreshIntegrations();
      
      toast({
        title: existingIntegration ? "Email settings updated" : "Email connected",
        description: "Your email configuration has been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error saving configuration",
        description: error.message || "Failed to save email configuration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsEncrypting(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await handleTestConnection();
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-full">
          <Mail className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-medium">Email Integration</h2>
          <p className="text-sm text-gray-500">Connect your email account to send messages directly from the platform</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your.email@example.com" 
                    {...field} 
                    required
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="smtpServer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Server</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="smtp.example.com" 
                      {...field} 
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="smtpPort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Port</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="587" 
                      {...field} 
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="imapServer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IMAP Server</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="imap.example.com" 
                      {...field} 
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imapPort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IMAP Port</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="993" 
                      {...field} 
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      required={!existingIntegration}
                    />
                    {isEncrypting && (
                      <div className="absolute inset-0 bg-muted/20 flex items-center justify-center rounded-md">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-3 w-3 text-primary animate-spin" />
                          <span className="text-xs text-muted-foreground">Encrypting...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  <span>Your password is encrypted before storage</span>
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleTest} 
              disabled={isTesting || isSubmitting}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : existingIntegration ? 'Update Configuration' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default EmailIntegrationTab;
