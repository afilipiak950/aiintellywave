
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
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
