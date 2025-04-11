
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface SaveAssignmentsButtonProps {
  onClick: () => Promise<void>;
  isSaving: boolean;
  isDisabled?: boolean;
}

export const SaveAssignmentsButton: React.FC<SaveAssignmentsButtonProps> = ({
  onClick,
  isSaving,
  isDisabled = false
}) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onClick}
        disabled={isSaving || isDisabled}
        className="flex items-center gap-2"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Assignments
      </Button>
    </div>
  );
};
