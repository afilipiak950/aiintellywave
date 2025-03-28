
import React from 'react';
import { Button } from "../../button";
import { Card } from "../../card";
import { Check, X } from 'lucide-react';

interface MilestoneFormProps {
  formData: {
    title: string;
    description: string;
    due_date: string;
    status: string;
  };
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({ 
  formData, 
  isEditing,
  onInputChange, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <Card className="p-4 border-blue-200 bg-blue-50">
      <h3 className="font-medium mb-2">{isEditing ? 'Edit Milestone' : 'Add New Milestone'}</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={onInputChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={onInputChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            {isEditing ? (
              <>
                <X size={14} className="mr-1" />
                Cancel
              </>
            ) : (
              'Cancel'
            )}
          </Button>
          <Button type="submit" size="sm">
            {isEditing ? (
              <>
                <Check size={14} className="mr-1" />
                Save Changes
              </>
            ) : (
              'Add Milestone'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MilestoneForm;
