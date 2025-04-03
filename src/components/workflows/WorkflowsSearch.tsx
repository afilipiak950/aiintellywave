
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface WorkflowsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const WorkflowsSearch: React.FC<WorkflowsSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows by name, description or tags..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
