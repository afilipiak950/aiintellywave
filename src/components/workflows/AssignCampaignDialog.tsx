
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InstantlyCampaign } from '@/services/instantlyService';

interface AssignCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: InstantlyCampaign | null;
  selectedCompanyId: string;
  onCompanyChange: (value: string) => void;
  onAssignClick: () => void;
  companies: { id: string; name: string; }[] | undefined;
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
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Campaign to Customer</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Campaign</label>
            <div className="px-3 py-2 bg-muted rounded-md">
              {campaign.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Customer</label>
            <Select value={selectedCompanyId} onValueChange={onCompanyChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
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
