
import React from 'react';
import { Lightbulb } from 'lucide-react';

export const TipsBestPractices = () => {
  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
      <h3 className="font-medium flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        Tips for Better Results
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Be specific in your requests for more accurate responses</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Provide context when asking follow-up questions</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Use the "regenerate" option if you'd like a different response</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Try different question formats if you're not getting the desired results</span>
        </li>
      </ul>
    </div>
  );
};
