
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ShareWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWorkflow: any | null;
  selectedCompany: string;
  onCompanyChange: (value: string) => void;
  onShareClick: () => void;
  companies: any[] | undefined;
  isLoading: boolean;
  isPending: boolean;
}

export const ShareWorkflowDialog: React.FC<ShareWorkflowDialogProps> = ({
  open,
  onOpenChange,
  selectedWorkflow,
  selectedCompany,
  onCompanyChange,
  onShareClick,
  companies,
  isLoading,
  isPending
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Workflow with Customer</DialogTitle>
          <DialogDescription>
            Select a customer to share "{selectedWorkflow?.name}" workflow with.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select value={selectedCompany || "select_company"} onValueChange={onCompanyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="select_company" disabled>Select a customer</SelectItem>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading companies...</SelectItem>
              ) : (
                companies?.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onShareClick}
            disabled={isPending || !selectedCompany || selectedCompany === "select_company"}
          >
            {isPending ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
