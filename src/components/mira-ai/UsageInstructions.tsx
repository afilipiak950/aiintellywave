
import React from 'react';
import { HelpCircle, Shield } from 'lucide-react';
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Search Setup</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
            <TabsTrigger value="examples">Search Examples</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
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
            <div className="p-4 bg-green-50 rounded-md border border-green-100">
              <h3 className="text-sm font-medium mb-2">Website Crawler</h3>
              <p className="text-xs text-gray-600">
                When using the Website tab, our system will visit and analyze the entire job posting page, 
                extracting all relevant details like positions, requirements, skills, experience levels, and locations.
                The generated search string will include all important information found on the page.
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
          
          <TabsContent value="permissions" className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium">Access & Permissions</h3>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                <h4 className="text-sm font-medium mb-2">Company Access</h4>
                <p className="text-xs text-gray-600">
                  Search strings are associated with your company account. Only users from the same company can access, 
                  edit, and view these search strings. Access is controlled by security policies on the server.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100">
                <h4 className="text-sm font-medium mb-2">Troubleshooting Permission Issues</h4>
                <p className="text-xs text-gray-600">
                  If you see permission errors when creating search strings, please check with your administrator 
                  that your user account has the correct role and company association. Administrators must also ensure 
                  the "Enable Search Strings" feature is activated for your company.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-md border border-green-100">
                <h4 className="text-sm font-medium mb-2">Admin Visibility</h4>
                <p className="text-xs text-gray-600">
                  All search strings created by your company's users will be visible to administrators in the admin portal. 
                  This allows administrators to review and manage search strings across the organization.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
