
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicsTabContent } from './tabs/BasicsTabContent';
import { FeaturesTabContent } from './tabs/FeaturesTabContent';
import { ExamplesTabContent } from './tabs/ExamplesTabContent';

export const UsageInstructions = () => {
  return (
    <Card className="mb-8 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          How to Use Mira Campaign Assistant
        </CardTitle>
        <CardDescription>
          Quick guide to building targeted campaigns and crafting perfect messages
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="basics">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics">Campaign Setup</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
            <TabsTrigger value="examples">Campaign Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="p-4 space-y-4">
            <BasicsTabContent />
          </TabsContent>

          <TabsContent value="features" className="p-4">
            <FeaturesTabContent />
          </TabsContent>

          <TabsContent value="examples" className="p-4 space-y-4">
            <ExamplesTabContent />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
