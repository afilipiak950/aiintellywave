
import React from 'react';

export const BasicsTabContent = () => {
  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 rounded-full p-2 mt-1">
          <span className="font-bold text-primary">1</span>
        </div>
        <div>
          <h3 className="font-medium">Define Your Search Goals</h3>
          <p className="text-sm text-muted-foreground">
            Start by telling Mira what type of candidates or leads you're looking for. For example: "I need to find senior software developers in Berlin with React experience."
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="bg-primary/10 rounded-full p-2 mt-1">
          <span className="font-bold text-primary">2</span>
        </div>
        <div>
          <h3 className="font-medium">Refine Your Search Parameters</h3>
          <p className="text-sm text-muted-foreground">
            Mira will ask targeted questions to narrow down search criteria like technical skills, experience level, location, industry, and other specific attributes.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="bg-primary/10 rounded-full p-2 mt-1">
          <span className="font-bold text-primary">3</span>
        </div>
        <div>
          <h3 className="font-medium">Get Your Optimized Search String</h3>
          <p className="text-sm text-muted-foreground">
            Once your parameters are defined, Mira will generate the perfect search string for platforms like LinkedIn, job boards, or your CRM to find exactly the right candidates or leads.
          </p>
        </div>
      </div>
    </div>
  );
};
