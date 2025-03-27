
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MiraAIHero } from "@/components/mira-ai/MiraAIHero";
import { FeatureHighlights } from "@/components/mira-ai/FeatureHighlights";
import { UsageInstructions } from "@/components/mira-ai/UsageInstructions";
import { TipsBestPractices } from "@/components/mira-ai/TipsBestPractices";
import { BasicsTabContent } from "@/components/mira-ai/tabs/BasicsTabContent";
import { FeaturesTabContent } from "@/components/mira-ai/tabs/FeaturesTabContent";
import { ExamplesTabContent } from "@/components/mira-ai/tabs/ExamplesTabContent";
import { AnimatedBackgroundWrapper } from "@/components/mira-ai/AnimatedBackgroundWrapper";
import { ChatbotInterface } from "@/components/mira-ai/ChatbotInterface";

export default function MiraAI() {
  return (
    <AnimatedBackgroundWrapper>
      <div className="space-y-8">
        <MiraAIHero />
        
        <ChatbotInterface />
        
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          <TabsContent value="basics">
            <BasicsTabContent />
          </TabsContent>
          <TabsContent value="features">
            <FeaturesTabContent />
          </TabsContent>
          <TabsContent value="examples">
            <ExamplesTabContent />
          </TabsContent>
        </Tabs>
        
        <FeatureHighlights />
        <UsageInstructions />
        <TipsBestPractices />
      </div>
    </AnimatedBackgroundWrapper>
  );
}
