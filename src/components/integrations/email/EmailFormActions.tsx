
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface EmailFormActionsProps {
  onTestClick: () => void;
  isTesting: boolean;
  isSubmitting: boolean;
  existingIntegration: boolean;
}

export const EmailFormActions: React.FC<EmailFormActionsProps> = ({ 
  onTestClick, 
  isTesting, 
  isSubmitting, 
  existingIntegration 
}) => {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <Button 
        variant="outline" 
        type="button" 
        onClick={onTestClick} 
        disabled={isTesting || isSubmitting}
      >
        {isTesting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          'Test Connection'
        )}
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : existingIntegration ? 'Update Configuration' : 'Save Configuration'}
      </Button>
    </div>
  );
};
