import React from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export const FeatureHighlights = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card className="relative overflow-hidden border-primary/10 transition-all hover:bg-white/10 hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Search Parameter Definition</CardTitle>
          <CardDescription>Create precise search criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Define exactly what you're looking for through guided questions that identify the perfect search terms and Boolean operators.
          </p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn more <Info className="h-3 w-3 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">How Search Definition Works</h4>
                <p className="text-xs">
                  Mira guides you through specific questions about your ideal candidates or leads, translating your requirements into optimized Boolean search strings with the right operators and modifiers.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-primary/10 transition-all hover:bg-white/10 hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Platform Optimization</CardTitle>
          <CardDescription>Platform-specific search formats</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Get search strings optimized for LinkedIn, job boards, CRM systems, and other recruitment or lead generation platforms.
          </p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn more <Info className="h-3 w-3 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Platform Optimization Features</h4>
                <p className="text-xs">
                  Different platforms use different search syntaxes and capabilities. Mira creates search strings properly formatted for your specific platform's requirements and limitations.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-primary/10 transition-all hover:bg-white/10 hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Target Refinement</CardTitle>
          <CardDescription>Fine-tune your search parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Refine your search with advanced filters for skills, experience, location, and other attributes to find exactly who you're looking for.
          </p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn more <Info className="h-3 w-3 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Search Refinement Capabilities</h4>
                <p className="text-xs">
                  Mira helps you build complex search parameters by combining positive and negative keywords, proximity operators, and nested Boolean logic to maximize the relevance of your search results.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>
    </div>
  );
};
