
import React from 'react';
import { InstantlyCampaign } from '@/services/instantlyService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface AssignCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: InstantlyCampaign | null;
  selectedCompanyId: string;
  onCompanyChange: (companyId: string) => void;
  onAssignClick: () => void;
  companies: { id: string; name: string }[] | undefined;
  isLoading: boolean;
  isPending: boolean;
}

export const AssignCampaignDialog: React.FC<AssignCampaignDialogProps> = ({
  open,
  onOpenChange,
  campaign,
  selectedCompanyId,
  onCompanyChange,
  onAssignClick,
  companies,
  isLoading,
  isPending
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Campaign to Customer</DialogTitle>
          <DialogDescription>
            {campaign ? `Select a customer to assign the "${campaign.name}" campaign to.` : 'Loading campaign details...'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select value={selectedCompanyId} onValueChange={onCompanyChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading companies...</SelectItem>
              ) : companies?.length === 0 ? (
                <SelectItem value="none" disabled>No companies available</SelectItem>
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
            onClick={onAssignClick}
            disabled={isPending || !selectedCompanyId || isLoading}
          >
            {isPending ? 'Assigning...' : 'Assign Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
