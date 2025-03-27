
import React from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export const FeatureHighlights = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card className="relative overflow-hidden border-primary/10 transition-all hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Campaign Definition</CardTitle>
          <CardDescription>Link goals with audience details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Define campaign objectives, target audiences, and success metrics through guided conversations.
          </p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn more <Info className="h-3 w-3 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">How Campaign Definition Works</h4>
                <p className="text-xs">
                  Mira guides you through a series of targeted questions to clarify your campaign goals, identify ideal audience segments, and establish metrics that matter for your specific objectives.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-primary/10 transition-all hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Message Creation</CardTitle>
          <CardDescription>Craft perfect outreach content</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Generate tailored messages, email sequences, and social posts optimized for your target audience.
          </p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn more <Info className="h-3 w-3 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Message Creation Features</h4>
                <p className="text-xs">
                  Specify your audience characteristics, campaign goals, and preferred tone, and Mira will generate compelling content that resonates with your ideal candidates or prospects.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-primary/10 transition-all hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Audience Targeting</CardTitle>
          <CardDescription>Refine your ideal candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Define and refine target personas with specific attributes, skills, and characteristics for precise outreach.
          </p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn more <Info className="h-3 w-3 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Audience Targeting Capabilities</h4>
                <p className="text-xs">
                  Mira helps you build detailed audience profiles by asking targeted questions about demographics, professional backgrounds, skills, and interests that matter most for your campaign.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>
    </div>
  );
};
