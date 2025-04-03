
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Server, Mail, Lock } from 'lucide-react';

const EmailIntegrationTab = () => {
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

      <div className="space-y-4">
        <FormItem>
          <FormLabel>Email Address</FormLabel>
          <FormControl>
            <Input type="email" placeholder="your.email@example.com" />
          </FormControl>
        </FormItem>
        
        <FormItem>
          <FormLabel>SMTP Server</FormLabel>
          <FormControl>
            <Input placeholder="smtp.example.com" />
          </FormControl>
        </FormItem>
        
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="••••••••" />
          </FormControl>
          <FormDescription>Your password is encrypted before storage</FormDescription>
        </FormItem>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline">Test Connection</Button>
          <Button>Save Configuration</Button>
        </div>
      </div>
    </Card>
  );
};

export default EmailIntegrationTab;
