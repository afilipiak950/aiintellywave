
import React from 'react';
import { MessageSquare, Lightbulb, Bot, Info } from 'lucide-react';
import { Card } from "@/components/ui/card";

export const FeaturesTabContent = () => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Natural Conversations</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Engage in human-like dialogue to solve problems and answer questions with context awareness.
        </p>
      </Card>

      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Content Generation</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Create emails, messages, and other content with customizable tone and style.
        </p>
      </Card>

      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Workflow Automation</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Automate repetitive tasks and streamline processes with AI-powered suggestions.
        </p>
      </Card>

      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Data Analysis</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Extract insights from your information and receive detailed summaries.
        </p>
      </Card>
    </div>
  );
};
