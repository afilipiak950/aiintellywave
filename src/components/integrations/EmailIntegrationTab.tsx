
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormField } from '@/components/ui/form';
import { Server, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

interface EmailFormValues {
  email: string;
  smtpServer: string;
  password: string;
}

const EmailIntegrationTab = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EmailFormValues>({
    defaultValues: {
      email: '',
      smtpServer: '',
      password: ''
    }
  });

  const onSubmit = async (data: EmailFormValues) => {
    setIsSubmitting(true);
    try {
      // This would be where you'd save the configuration
      console.log('Saving email configuration:', data);
      // Wait for a short time to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <Input type="email" placeholder="your.email@example.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="smtpServer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SMTP Server</FormLabel>
                <FormControl>
                  <Input placeholder="smtp.example.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormDescription>Your password is encrypted before storage</FormDescription>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button">Test Connection</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default EmailIntegrationTab;
