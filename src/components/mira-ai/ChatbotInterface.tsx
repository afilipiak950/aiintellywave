
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ChatbotInterface = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Chat with AI Assistant</CardTitle>
        <CardDescription>
          Get answers to your questions and assistance with your tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <iframe
          src="https://www.chatbase.co/chatbot-iframe/WYt_wu0y3qZMyNLTWhp4p"
          width="100%"
          style={{ height: "700px", minHeight: "700px" }}
          frameBorder="0"
          title="AI Chatbot"
        />
      </CardContent>
    </Card>
  );
};
