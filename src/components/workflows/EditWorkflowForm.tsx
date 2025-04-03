
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface WorkflowFormData {
  name: string;
  description: string;
  tags: string;
  is_active: boolean;
}

interface EditWorkflowFormProps {
  workflow: {
    id: string;
    name: string;
    description?: string;
    tags?: string[];
    is_active: boolean;
  };
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export const EditWorkflowForm: React.FC<EditWorkflowFormProps> = ({
  workflow,
  onSubmit,
  isPending
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<WorkflowFormData>({
    defaultValues: {
      name: workflow.name,
      description: workflow.description || '',
      tags: workflow.tags?.join(', ') || '',
      is_active: workflow.is_active
    }
  });

  const processForm = (data: WorkflowFormData) => {
    // Process tags from comma-separated string to array
    const processedData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };
    
    onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit(processForm)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          {...register('description')}
          rows={3}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input 
          id="tags" 
          {...register('tags')}
          placeholder="tag1, tag2, tag3"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="is_active" 
          {...register('is_active')} 
          defaultChecked={workflow.is_active}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
};
