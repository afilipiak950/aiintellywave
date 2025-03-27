
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePersonas } from '@/hooks/use-personas';
import { EmailContact } from '@/types/persona';
import { Import, Upload, Mailbox } from 'lucide-react';

const bulkImportSchema = z.object({
  emails: z.string().min(1, {
    message: 'Please enter at least one email address.',
  }),
});

type BulkImportValues = z.infer<typeof bulkImportSchema>;

export function EmailContactsCard() {
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const { toast } = useToast();
  const { emailContacts, createEmailContacts } = usePersonas();

  const bulkImportForm = useForm<BulkImportValues>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      emails: '',
    },
  });

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
    </Card>
  );
}
