
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  loading: boolean;
  onCancel: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ loading, onCancel }) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Customer"}
      </Button>
    </div>
  );
};

export default FormActions;
