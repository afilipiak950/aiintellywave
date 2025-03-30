
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LinkedInIntegrationSection from '@/components/personas/LinkedInIntegrationSection';
import XingIntegrationSection from '@/components/personas/XingIntegrationSection';
import { Card } from '@/components/ui/card';
import AnimatedBubbles from '@/components/animations/AnimatedBubbles';

const IntegrationsPage = () => {
  return (
    <div className="container mx-auto p-6 relative">
      {/* Animierte Bubbles im Hintergrund */}
      <AnimatedBubbles />
      
      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-6">Social Integrations</h1>
        
        <Tabs defaultValue="linkedin" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="xing">Xing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="linkedin" className="mt-4">
            <LinkedInIntegrationSection />
            
            <Card className="mt-6 p-4">
              <h3 className="font-medium mb-2">About LinkedIn Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect your LinkedIn account to automatically sync contacts, post updates, and analyze your professional network.
                This integration allows you to leverage your LinkedIn connections for business development.
              </p>
            </Card>
          </TabsContent>
          
          <TabsContent value="xing" className="mt-4">
            <XingIntegrationSection />
            
            <Card className="mt-6 p-4">
              <h3 className="font-medium mb-2">About Xing Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Xing account to expand your reach in European markets, particularly in German-speaking regions.
                This integration enables automatic business contact syncing and networking opportunities.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IntegrationsPage;
