
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ChatbotInterface = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Generate Your Perfect Campaign Search String</CardTitle>
        <CardDescription>
          Let Mira guide you through questions to create the ideal search parameters for finding candidates and leads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <iframe
          src="https://www.chatbase.co/chatbot-iframe/WYt_wu0y3qZMyNLTWhp4p"
          width="100%"
          style={{ height: "700px", minHeight: "700px" }}
          frameBorder="0"
          title="AI Campaign Search Assistant"
        />
      </CardContent>
    </Card>
  );
};
