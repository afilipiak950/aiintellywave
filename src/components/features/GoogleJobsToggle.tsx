
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface GoogleJobsToggleProps {
  isEnabled: boolean;
  onToggle: () => Promise<void>;
  isLoading: boolean;
}

export const GoogleJobsToggle = ({ 
  isEnabled, 
  onToggle, 
  isLoading 
}: GoogleJobsToggleProps) => {
  const handleToggle = async () => {
    console.log(`[Feature Debug] Toggling Google Jobs feature from ${isEnabled} to ${!isEnabled}`);
    await onToggle();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">Google Jobs Feature (Jobangebote)</span>
          {isEnabled && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Enabled
            </span>
          )}
          {!isEnabled && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              Disabled
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
          ) : (
            <Switch 
              checked={isEnabled} 
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
          )}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>
          {isEnabled 
            ? "Users will see the Jobangebote page in their sidebar menu." 
            : "Users will not see the Jobangebote page in their sidebar menu."}
        </p>
        
        <div className="mt-2 flex items-start gap-1 text-amber-600">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <p>Changes to this setting require a sidebar reload to take effect.</p>
        </div>
      </div>
    </div>
  );
};
