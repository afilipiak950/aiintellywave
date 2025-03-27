
import React from 'react';
import { Lightbulb } from 'lucide-react';

export const TipsBestPractices = () => {
  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
      <h3 className="font-medium flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        Tips for Better Campaigns
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Define your campaign goals clearly to receive more targeted suggestions</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Provide detailed candidate attributes for more precise audience targeting</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Use the "refine" option if you'd like to adjust your campaign parameters</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary font-bold">•</span>
          <span>Test different messaging approaches for various audience segments</span>
        </li>
      </ul>
    </div>
  );
};
