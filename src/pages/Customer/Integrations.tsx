
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Linkedin, Mail, MessageSquare } from 'lucide-react';
import EmailIntegrationTab from '@/components/integrations/EmailIntegrationTab';
import XingIntegrationTab from '@/components/integrations/XingIntegrationTab';
import LinkedInIntegrationTab from '@/components/integrations/LinkedInIntegrationTab';

const IntegrationsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Integrations</h1>
      
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex items-center gap-2">
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </TabsTrigger>
          <TabsTrigger value="xing" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Xing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="email">
          <EmailIntegrationTab />
        </TabsContent>
        
        <TabsContent value="linkedin">
          <LinkedInIntegrationTab />
        </TabsContent>
        
        <TabsContent value="xing">
          <XingIntegrationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsPage;
