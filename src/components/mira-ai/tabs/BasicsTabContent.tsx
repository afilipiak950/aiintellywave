
import React from 'react';

export const BasicsTabContent = () => {
  return (
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
  );
};
