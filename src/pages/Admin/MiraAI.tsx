
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Lightbulb, MessageSquare, Bot, HelpCircle, ArrowRight } from 'lucide-react';

const MiraAI = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-4">
          Mira AI Assistant
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your intelligent AI assistant for automating tasks, generating content, and enhancing your workflow.
        </p>
      </div>

      {/* Usage Instructions */}
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

      {/* Feature Highlights */}
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

      {/* Chat Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Start a Conversation with Mira</CardTitle>
          <CardDescription>
            Type your message below to begin interacting with Mira AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md h-64 mb-4 flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-12 w-12 text-primary/50 mx-auto mb-2" />
              <p className="text-muted-foreground">Your conversation with Mira will appear here</p>
              <p className="text-xs text-muted-foreground mt-1">Ask a question to get started</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type your message here..." 
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" 
            />
            <Button>
              Send <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips and Best Practices */}
      <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
        <h3 className="font-medium flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Tips for Better Results
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Be specific in your requests for more accurate responses</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Provide context when asking follow-up questions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Use the "regenerate" option if you'd like a different response</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Try different question formats if you're not getting the desired results</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MiraAI;
