
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from 'lucide-react';
import { FeatureStatusBadge } from './FeatureStatusBadge';

interface GoogleJobsToggleProps {
  isEnabled: boolean;
  onToggle: () => Promise<void>;
  isLoading: boolean;
}

export const GoogleJobsToggle = ({ isEnabled, onToggle, isLoading }: GoogleJobsToggleProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>Google Jobs (Jobangebote):</span>
          <FeatureStatusBadge isEnabled={isEnabled} />
        </div>
        
        <Button 
          size="sm" 
          variant={isEnabled ? "destructive" : "default"}
          onClick={onToggle}
          disabled={isLoading}
        >
          {isEnabled ? "Disable" : "Enable"}
        </Button>
      </div>
      
      {isEnabled && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Feature Enabled</AlertTitle>
          <AlertDescription>
            The Jobangebote feature is enabled. You should see it in your sidebar menu.
            If it's not visible, try refreshing the page or use the "Repair Features" button.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
