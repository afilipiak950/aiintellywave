
import React from 'react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { DialogFooter } from "../../ui/dialog";
import { ProjectFormData } from "../../../hooks/use-project-form";

interface ProjectCreateFormProps {
  formData: ProjectFormData;
  companies: { id: string; name: string; }[];
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const ProjectCreateForm: React.FC<ProjectCreateFormProps> = ({
  formData,
  companies,
  loading,
  onInputChange,
  onSelectChange,
  onSubmit,
  onClose
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter project name"
          value={formData.name}
          onChange={onInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter project description"
          value={formData.description}
          onChange={onInputChange}
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Select 
          value={formData.company_id} 
          onValueChange={(value) => onSelectChange('company_id', value)}
          disabled={loading || companies.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => onSelectChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={onInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={onInputChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="budget">Budget</Label>
        <Input
          id="budget"
          name="budget"
          type="number"
          step="0.01"
          placeholder="Enter budget amount"
          value={formData.budget}
          onChange={onInputChange}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.name || !formData.company_id}>
          {loading ? 'Creating...' : 'Create Project'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ProjectCreateForm;
