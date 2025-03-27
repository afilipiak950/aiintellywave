
import React from 'react';
import { MessageSquare, Lightbulb, Target, Repeat } from 'lucide-react';
import { Card } from "@/components/ui/card";

export const FeaturesTabContent = () => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Audience Targeting</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Define ideal candidate profiles with specific skills, experiences, demographics, and interests for precise outreach.
        </p>
      </Card>

      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Message Sequencing</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Create structured outreach sequences with initial messages, follow-ups, and targeted calls to action.
        </p>
      </Card>

      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Campaign Strategy</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Develop comprehensive campaign approaches with defined goals, timelines, and success metrics.
        </p>
      </Card>

      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Repeat className="h-4 w-4 text-primary" />
          <h3 className="font-medium">A/B Testing</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate multiple message variants to test and refine your approach for different audience segments.
        </p>
      </Card>
    </div>
  );
};
