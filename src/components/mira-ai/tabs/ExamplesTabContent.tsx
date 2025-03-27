
import React from 'react';

export const ExamplesTabContent = () => {
  return (
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
  );
};
