
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePersonas } from '@/hooks/use-personas';
import { EmailIntegration } from '@/types/persona';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

const providerFormSchema = z.object({
  provider: z.enum(['gmail', 'outlook', 'linkedin', 'other']),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

type ProviderFormValues = z.infer<typeof providerFormSchema>;

export function EmailAccountsCard() {
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const { emailIntegrations, createEmailIntegration } = usePersonas();

  const providerForm = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      provider: 'gmail',
      email: '',
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

  return (
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
    </Card>
  );
}
