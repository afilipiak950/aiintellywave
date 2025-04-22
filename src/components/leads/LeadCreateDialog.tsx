
import { useState } from 'react';
import { Lead } from '@/types/lead';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeadStatus } from '@/types/lead';
import { useForm, Controller } from 'react-hook-form';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LeadCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateLead: (lead: Partial<Lead>) => Promise<Lead | null>;
  projects: { id: string; name: string }[];
  defaultProjectId?: string;
}

const LeadCreateDialog = ({ 
  open, 
  onClose, 
  onCreateLead, 
  projects,
  defaultProjectId
}: LeadCreateDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm({
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      position: '',
      status: 'new' as LeadStatus,
      notes: '',
      project_id: defaultProjectId || '',
    },
  });
  
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const created = await onCreateLead(data);
      if (created) {
        form.reset();
        onClose();
      } else {
        setError('Failed to create lead. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogDescription>
            Enter the details to create a new lead. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter lead name"
                {...form.register('name', { required: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">
                Company
              </Label>
              <Input
                id="company"
                placeholder="Company name"
                {...form.register('company')}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...form.register('email')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone
              </Label>
              <Input
                id="phone"
                placeholder="Phone number"
                {...form.register('phone')}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">
                Position
              </Label>
              <Input
                id="position"
                placeholder="Job title"
                {...form.register('position')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">
                Status *
              </Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Lead Status</SelectLabel>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project_id">
              Project *
            </Label>
            <Controller
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Projects</SelectLabel>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes..."
              rows={3}
              {...form.register('notes')}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCreateDialog;
