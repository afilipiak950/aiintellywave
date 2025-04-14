
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface FeatureStatusBadgeProps {
  isEnabled: boolean;
}

export const FeatureStatusBadge = ({ isEnabled }: FeatureStatusBadgeProps) => {
  return (
    <Badge variant={isEnabled ? "default" : "outline"}>
      {isEnabled ? "Enabled" : "Disabled"}
    </Badge>
  );
};
