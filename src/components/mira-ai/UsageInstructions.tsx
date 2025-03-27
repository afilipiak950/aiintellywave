
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Lightbulb, Bot, Info } from 'lucide-react';

export const UsageInstructions = () => {
  return (
    <Card className="mb-8 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          How to Use Mira AI
        </CardTitle>
        <CardDescription>
          Quick guide to get started with Mira's features
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="basics">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
            <TabsTrigger value="examples">Usage Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="p-4 space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Start a Conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Type your question or request in the input field below and press Enter or click the send button to begin interacting with Mira.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Be Specific</h3>
                  <p className="text-sm text-muted-foreground">
                    For best results, be clear about what you need. Specific questions yield better answers than vague requests.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Follow-up Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Mira remembers your conversation context, so you can ask follow-up questions to refine or expand on previous responses.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="p-4">
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
          </TabsContent>

          <TabsContent value="examples" className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="bg-muted/40 p-3 rounded-md">
                <p className="font-medium text-sm mb-1">"Generate an email to follow up with a lead who hasn't responded"</p>
                <p className="text-xs text-muted-foreground">
                  Mira will create a professionally crafted follow-up email tailored to your needs.
                </p>
              </div>

              <div className="bg-muted/40 p-3 rounded-md">
                <p className="font-medium text-sm mb-1">"Summarize the key points from our recent customer feedback"</p>
                <p className="text-xs text-muted-foreground">
                  Mira will analyze and condense feedback into actionable insights.
                </p>
              </div>

              <div className="bg-muted/40 p-3 rounded-md">
                <p className="font-medium text-sm mb-1">"Help me organize the project timeline for the new website design"</p>
                <p className="text-xs text-muted-foreground">
                  Mira will suggest timeline structures and task breakdowns.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
