
import React from 'react';

export const BasicsTabContent = () => {
  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 rounded-full p-2 mt-1">
          <span className="font-bold text-primary">1</span>
        </div>
        <div>
          <h3 className="font-medium">Define Your Campaign</h3>
          <p className="text-sm text-muted-foreground">
            Start by telling Mira your campaign goals, target audience, and key messages. For example: "I need to create a campaign to recruit senior software developers in Berlin."
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="bg-primary/10 rounded-full p-2 mt-1">
          <span className="font-bold text-primary">2</span>
        </div>
        <div>
          <h3 className="font-medium">Refine Your Audience</h3>
          <p className="text-sm text-muted-foreground">
            Mira will guide you through questions to define your ideal candidates or prospects with specific attributes like skills, experience level, location, and interests.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="bg-primary/10 rounded-full p-2 mt-1">
          <span className="font-bold text-primary">3</span>
        </div>
        <div>
          <h3 className="font-medium">Create Your Messages</h3>
          <p className="text-sm text-muted-foreground">
            Once your campaign and audience are defined, Mira will help you craft personalized outreach sequences, including initial messages, follow-ups, and call-to-action content.
          </p>
        </div>
      </div>
    </div>
  );
};
