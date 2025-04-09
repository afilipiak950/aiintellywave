
import React from 'react';
import { InstantlyCampaign } from '@/services/instantlyService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssignCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: InstantlyCampaign | null;
  selectedCompanyId: string;
  onCompanyChange: (companyId: string) => void;
  onAssignClick: () => void;
  companies: { id: string; name: string }[] | null;
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
            Select a customer to assign the campaign "{campaign?.name}" to.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedCompanyId} onValueChange={onCompanyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading companies...</SelectItem>
              ) : companies?.length ? (
                companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>No companies available</SelectItem>
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
            disabled={isPending || !selectedCompanyId}
          >
            {isPending ? 'Assigning...' : 'Assign Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
