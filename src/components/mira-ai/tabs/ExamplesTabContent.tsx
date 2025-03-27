
import React from 'react';

export const ExamplesTabContent = () => {
  return (
    <div className="space-y-3">
      <div className="bg-muted/40 p-3 rounded-md">
        <p className="font-medium text-sm mb-1">"I need a search string to find senior frontend developers in Berlin with React experience"</p>
        <p className="text-xs text-muted-foreground">
          Mira will create a Boolean search string with technical skills, location parameters, and experience level modifiers.
        </p>
      </div>

      <div className="bg-muted/40 p-3 rounded-md">
        <p className="font-medium text-sm mb-1">"Generate a search query for finding first-time homebuyers in the Miami area"</p>
        <p className="text-xs text-muted-foreground">
          Mira will develop search parameters combining location data with specific terms that identify potential first-time homebuyers.
        </p>
      </div>

      <div className="bg-muted/40 p-3 rounded-md">
        <p className="font-medium text-sm mb-1">"Create a search to identify healthcare executives interested in compliance software"</p>
        <p className="text-xs text-muted-foreground">
          Mira will generate a string with healthcare industry terms, executive-level titles, and compliance-related interests for targeted searching.
        </p>
      </div>
    </div>
  );
};
