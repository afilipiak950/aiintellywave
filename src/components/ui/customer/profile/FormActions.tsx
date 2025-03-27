
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel?: () => void;
  isSubmitting: boolean;
  cancelLabel?: string;
  submitLabel?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  isSubmitting, 
  cancelLabel = 'Cancel',
  submitLabel = 'Save Changes'
}) => {
  return (
    <div className="flex justify-end space-x-2">
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      )}
      <Button 
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
};
