
import React from 'react';
import { MultiSelect } from '@/components/ui/multiselect';

interface CompanySelectorProps {
  options: { value: string; label: string }[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  options,
  selectedIds,
  onChange,
  isLoading = false,
  disabled = false
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Assign Companies to Campaign</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select the companies that should be assigned to this campaign.
      </p>
      
      <MultiSelect
        options={options}
        selected={selectedIds}
        onChange={onChange}
        placeholder="Select companies..."
        emptyMessage="No companies available"
        className="w-full"
        disabled={disabled || isLoading}
      />
    </div>
  );
};
