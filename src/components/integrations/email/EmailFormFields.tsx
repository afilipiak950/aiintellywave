
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { EmailFormValues } from './types';

interface EmailFormFieldsProps {
  form: UseFormReturn<EmailFormValues>;
  isEncrypting: boolean;
}

export const EmailFormFields: React.FC<EmailFormFieldsProps> = ({ form, isEncrypting }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input placeholder="your.email@example.com" {...field} />
            </FormControl>
            <FormMessage />
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
              <div className="relative">
                <Input 
                  type="password" 
                  placeholder="Your email password" 
                  {...field} 
                  className={isEncrypting ? "bg-green-50 transition-colors" : ""}
                />
                {isEncrypting && (
                  <Lock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 animate-pulse" />
                )}
              </div>
            </FormControl>
            <FormMessage />
            <p className="text-xs text-muted-foreground">
              Your password is encrypted and stored securely.
            </p>
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="smtpServer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP Server</FormLabel>
              <FormControl>
                <Input placeholder="smtp.gmail.com" {...field} />
              </FormControl>
              <FormMessage />
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
                <Input placeholder="587" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="imapServer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IMAP Server</FormLabel>
              <FormControl>
                <Input placeholder="imap.gmail.com" {...field} />
              </FormControl>
              <FormMessage />
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
                <Input placeholder="993" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
