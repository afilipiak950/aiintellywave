
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Network } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailIntegrationEnhancedSection from '@/components/personas/EmailIntegrationEnhancedSection';
import LinkedInIntegrationSection from '@/components/personas/LinkedInIntegrationSection';
import XingIntegrationSection from '@/components/personas/XingIntegrationSection';

const EnhancedIntegrations = () => {
  return (
    <div className="container mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Enhanced Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your external accounts with advanced security protocols
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <CardTitle>Security Information</CardTitle>
            </div>
            <CardDescription>
              Your credentials are protected using enterprise-grade encryption
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-start gap-3 rounded-md bg-muted/50 p-3">
              <Lock className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h4 className="text-sm font-medium">Military-grade encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All credentials are encrypted on your device before transmission and stored securely.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md bg-muted/50 p-3">
              <Network className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h4 className="text-sm font-medium">Secure access controls</h4>
                <p className="text-sm text-muted-foreground">
                  Only authorized administrators can decrypt credentials when necessary, with all access fully audited.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="xing">Xing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <EmailIntegrationEnhancedSection />
          </TabsContent>
          
          <TabsContent value="linkedin">
            <LinkedInIntegrationSection />
          </TabsContent>
          
          <TabsContent value="xing">
            <XingIntegrationSection />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default EnhancedIntegrations;
