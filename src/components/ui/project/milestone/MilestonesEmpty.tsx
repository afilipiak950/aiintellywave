
import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from "../../button";

interface MilestonesEmptyProps {
  canEdit: boolean;
  onAddClick: () => void;
}

const MilestonesEmpty: React.FC<MilestonesEmptyProps> = ({ 
  canEdit, 
  onAddClick 
}) => {
  return (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No milestones yet</h3>
      <p className="text-gray-500 mt-1">
        Get started by adding the first milestone to this project.
      </p>
      {canEdit && (
        <Button 
          onClick={onAddClick} 
          className="mt-4"
        >
          <Plus size={16} className="mr-1" />
          Add First Milestone
        </Button>
      )}
    </div>
  );
};

export default MilestonesEmpty;
