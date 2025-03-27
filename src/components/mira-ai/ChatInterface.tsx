
import React from 'react';
import { ArrowRight, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ChatInterface = () => {
  return (
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
  );
};
