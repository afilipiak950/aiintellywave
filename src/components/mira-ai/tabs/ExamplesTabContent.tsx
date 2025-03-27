
import React from 'react';

export const ExamplesTabContent = () => {
  return (
    <div className="space-y-3">
      <div className="bg-muted/40 p-3 rounded-md">
        <p className="font-medium text-sm mb-1">"Create a campaign to recruit senior frontend developers in Berlin with React experience"</p>
        <p className="text-xs text-muted-foreground">
          Mira will define your target audience and create personalized outreach messages for tech recruitment.
        </p>
      </div>

      <div className="bg-muted/40 p-3 rounded-md">
        <p className="font-medium text-sm mb-1">"Help me build a real estate lead generation campaign for first-time homebuyers"</p>
        <p className="text-xs text-muted-foreground">
          Mira will develop a prospect profile and create an email sequence to nurture potential homebuyers.
        </p>
      </div>

      <div className="bg-muted/40 p-3 rounded-md">
        <p className="font-medium text-sm mb-1">"Design an outreach campaign for healthcare executives about our new compliance software"</p>
        <p className="text-xs text-muted-foreground">
          Mira will help you identify key decision-makers and craft industry-specific messaging that addresses compliance concerns.
        </p>
      </div>
    </div>
  );
};
