
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

interface RefreshFeaturesButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
}

export const RefreshFeaturesButton = ({ onClick, isLoading }: RefreshFeaturesButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
      Refresh Features
    </Button>
  );
};
