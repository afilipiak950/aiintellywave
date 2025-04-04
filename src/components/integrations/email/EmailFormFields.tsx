import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Lock, RefreshCw } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { EmailFormValues } from './types';

interface EmailFormFieldsProps {
  form: UseFormReturn<EmailFormValues>;
  isEncrypting: boolean;
}

export const EmailFormFields: React.FC<EmailFormFieldsProps> = ({ form, isEncrypting }) => {
  return (
    <>
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
                  required={!form.formState.defaultValues?.email}
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
    </>
  );
};
