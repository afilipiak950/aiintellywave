
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicsTabContent } from './tabs/BasicsTabContent';
import { FeaturesTabContent } from './tabs/FeaturesTabContent';
import { ExamplesTabContent } from './tabs/ExamplesTabContent';
import BooleanSearchExplainer from '../customer/search-strings/BooleanSearchExplainer';

export const UsageInstructions = () => {
  return (
    <Card className="mb-8 border-primary/20 hover:bg-white/10 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          How to Use Mira Search String Generator
        </CardTitle>
        <CardDescription>
          Quick guide to creating the perfect search parameters for your campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="basics">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics">Search Setup</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
            <TabsTrigger value="examples">Search Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="p-4 space-y-4">
            <BasicsTabContent />
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
              <h3 className="text-sm font-medium mb-2">Input Processing Guarantee</h3>
              <p className="text-xs text-gray-600">
                Our advanced search string generator fully processes all of your input text. Every detail you provide
                will be analyzed and included in the generated search string. The more detailed your input, the more 
                precise your search results will be.
              </p>
            </div>
            <BooleanSearchExplainer compact={true} />
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
