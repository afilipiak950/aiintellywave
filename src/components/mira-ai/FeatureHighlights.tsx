
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
          <CardTitle className="text-lg">Smart Responses</CardTitle>
          <CardDescription>AI-powered communication assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Get intelligent response suggestions for emails, messages, and customer inquiries.
          </p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn more <Info className="h-3 w-3 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">How Smart Responses Work</h4>
                <p className="text-xs">
                  Mira analyzes the context of your conversations and generates appropriate responses based on your communication style and the specific situation.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-primary/10 transition-all hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Content Creation</CardTitle>
          <CardDescription>Generate professional content</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Create marketing copy, product descriptions, social media posts, and more.
          </p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn more <Info className="h-3 w-3 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Content Creation Features</h4>
                <p className="text-xs">
                  Specify your target audience, tone, and key points, and Mira will generate polished content that aligns with your brand voice.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-primary/10 transition-all hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Research Assistant</CardTitle>
          <CardDescription>Find information quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Research topics, find answers to questions, and get summarized information.
          </p>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Learn more <Info className="h-3 w-3 ml-1" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Research Capabilities</h4>
                <p className="text-xs">
                  Mira can help you gather information, compile research, and provide concise summaries on various topics relevant to your business.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>
    </div>
  );
};
