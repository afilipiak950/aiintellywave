
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePersonas } from '@/hooks/use-personas';
import { EmailIntegration, EmailContact } from '@/types/persona';
import { Mail, Import, Upload, Mailbox } from 'lucide-react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const providerFormSchema = z.object({
  provider: z.enum(['gmail', 'outlook', 'linkedin', 'other']),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

const bulkImportSchema = z.object({
  emails: z.string().min(1, {
    message: 'Please enter at least one email address.',
  }),
});

type ProviderFormValues = z.infer<typeof providerFormSchema>;
type BulkImportValues = z.infer<typeof bulkImportSchema>;

export function EmailIntegrationSection() {
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const { toast } = useToast();
  const { emailIntegrations, emailContacts, createEmailIntegration, createEmailContacts } = usePersonas();

  const providerForm = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      provider: 'gmail',
      email: '',
    },
  });

  const bulkImportForm = useForm<BulkImportValues>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      emails: '',
    },
  });

  const onProviderSubmit = (values: ProviderFormValues) => {
    createEmailIntegration({
      provider: values.provider,
      email: values.email,
    });
    setIsProviderDialogOpen(false);
    providerForm.reset();
  };

  const onBulkImportSubmit = (values: BulkImportValues) => {
    const emailLines = values.emails.split('\n').filter(line => line.trim());
    const contacts: Omit<EmailContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let validCount = 0;
    let invalidEmails: string[] = [];
    
    emailLines.forEach(line => {
      const trimmedLine = line.trim();
      if (emailRegex.test(trimmedLine)) {
        contacts.push({ email: trimmedLine });
        validCount++;
      } else if (trimmedLine) {
        invalidEmails.push(trimmedLine);
      }
    });
    
    if (contacts.length > 0) {
      createEmailContacts(contacts);
    }
    
    setIsBulkImportDialogOpen(false);
    bulkImportForm.reset();
    
    if (invalidEmails.length > 0) {
      toast({
        title: 'Import partially successful',
        description: `Added ${validCount} emails. ${invalidEmails.length} invalid emails were skipped.`,
        variant: 'default',
      });
    } else {
      toast({
        title: 'Import successful',
        description: `Added ${validCount} email${validCount !== 1 ? 's' : ''} successfully.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Email & Platform Integrations</h2>
      <p className="text-muted-foreground">
        Connect your email accounts to use your personas for outreach, or import your contacts.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Connected Accounts
            </CardTitle>
            <CardDescription>
              Integrate with email providers and communication platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailIntegrations.length > 0 ? (
              <div className="space-y-3">
                {emailIntegrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{integration.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{integration.provider}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Disconnect</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-md bg-muted/50">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No accounts connected yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setIsProviderDialogOpen(true)}>
              Connect Account
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Import className="h-5 w-5" />
              Email Contacts
            </CardTitle>
            <CardDescription>
              Import email contacts for outreach campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailContacts.length > 0 ? (
              <div>
                <div className="mb-2 text-sm font-medium">Imported Contacts</div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Total Contacts</span>
                    <span className="text-sm font-bold">{emailContacts.length}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Use these contacts with your personas for consistent outreach
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-md bg-muted/50">
                <Mailbox className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No contacts imported yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setIsBulkImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Contacts
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Provider Connection Dialog */}
      <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Email Account</DialogTitle>
          </DialogHeader>
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
                <Button type="submit">Connect Account</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Import Dialog */}
      <Dialog open={isBulkImportDialogOpen} onOpenChange={setIsBulkImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Email Contacts</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="paste">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">Paste Emails</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="py-4">
              <Form {...bulkImportForm}>
                <form onSubmit={bulkImportForm.handleSubmit(onBulkImportSubmit)} className="space-y-4">
                  <FormField
                    control={bulkImportForm.control}
                    name="emails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Addresses</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste email addresses, one per line" 
                            className="h-60 font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsBulkImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Import Emails</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="upload" className="py-4">
              <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-md">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center font-medium mb-2">Drag & drop or click to upload</p>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Supports CSV files with email addresses
                </p>
                <Button>Upload File</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
