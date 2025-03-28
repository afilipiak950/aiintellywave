
import React from 'react';
import { Button } from "../../button";
import { Card } from "../../card";
import { Check, X } from 'lucide-react';
import { Task } from '../../../../types/project';

interface TaskFormProps {
  formData: {
    title: string;
    description: string;
    status: string;
    due_date: string;
    assigned_to: string;
  };
  availableUsers: { id: string; name: string }[];
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  formData,
  availableUsers,
  isEditing,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  return (
    <Card className="p-3 bg-gray-50">
      <h4 className="text-sm font-medium mb-2">
        {isEditing ? 'Edit Task' : 'Add New Task'}
      </h4>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onInputChange}
            required
            className="w-full px-3 py-1 text-sm border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows={2}
            className="w-full px-3 py-1 text-sm border rounded-md"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={onInputChange}
              className="w-full px-3 py-1 text-sm border rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={onInputChange}
              className="w-full px-3 py-1 text-sm border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={onInputChange}
              className="w-full px-3 py-1 text-sm border rounded-md"
            >
              <option value="">Not Assigned</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            <X size={12} className="mr-1" />
            Cancel
          </Button>
          <Button type="submit" size="sm">
            <Check size={12} className="mr-1" />
            {isEditing ? 'Update' : 'Add'} Task
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TaskForm;
