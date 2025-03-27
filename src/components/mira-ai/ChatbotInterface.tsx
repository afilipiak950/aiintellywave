
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ChatbotInterface = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Build Your Perfect Campaign</CardTitle>
        <CardDescription>
          Get guided assistance to create targeted outreach campaigns and find ideal candidates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <iframe
          src="https://www.chatbase.co/chatbot-iframe/WYt_wu0y3qZMyNLTWhp4p"
          width="100%"
          style={{ height: "700px", minHeight: "700px" }}
          frameBorder="0"
          title="AI Campaign Assistant"
        />
      </CardContent>
    </Card>
  );
};
