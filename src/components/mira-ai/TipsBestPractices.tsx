
import React from 'react';
import { Lightbulb } from 'lucide-react';

export const TipsBestPractices = () => {
  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
      <h3 className="font-medium flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        Tips for Better Search Strings
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Be specific about required skills and qualifications to narrow your search results</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Include both technical terms and soft skills for a more balanced candidate search</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Use the "refine" option if your initial search string returns too many or too few results</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Consider different keyword variations to capture all potential matches in your target group</span>
        </li>
      </ul>
    </div>
  );
};
