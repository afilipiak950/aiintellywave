
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from 'lucide-react';

interface FeatureRepairButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export const FeatureRepairButton = ({ onClick, isLoading, disabled }: FeatureRepairButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="default"
      disabled={isLoading || disabled}
      className="flex items-center gap-2"
    >
      <Settings size={16} className={isLoading ? "animate-spin" : ""} />
      Repair Features
    </Button>
  );
};
