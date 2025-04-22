
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Lead } from '@/types/lead';
import { Search, Filter, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeadFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  projectFilter: string;
  onProjectFilterChange: (value: string) => void;
  projects: { id: string; name: string }[];
  totalLeadCount: number;
  filteredCount: number;
  duplicatesCount?: number;
  isInProjectContext?: boolean;
}

const LeadFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  projectFilter,
  onProjectFilterChange,
  projects,
  totalLeadCount,
  filteredCount,
  duplicatesCount = 0,
  isInProjectContext = false
}: LeadFiltersProps) => {
  // Persist filter settings to localStorage
  useEffect(() => {
    if (searchTerm) localStorage.setItem('leadSearchTerm', searchTerm);
    else localStorage.removeItem('leadSearchTerm');
  }, [searchTerm]);
  
  useEffect(() => {
    localStorage.setItem('leadStatusFilter', statusFilter);
  }, [statusFilter]);
  
  useEffect(() => {
    if (!isInProjectContext) { // Only save project filter if not in project context
      localStorage.setItem('leadProjectFilter', projectFilter);
    }
  }, [projectFilter, isInProjectContext]);
  
  const leadStatusOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ];
  
  // Compute filter count badge
  const activeFilterCount = [
    searchTerm !== '',
    statusFilter !== 'all',
    projectFilter !== 'all' && !isInProjectContext
  ].filter(Boolean).length;
  
  return (
    <div className="mb-6 mt-4 space-y-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-1 w-full md:w-auto flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Lead Status</SelectLabel>
                {leadStatusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          {/* Project Filter - only if not in project context */}
          {!isInProjectContext && (
            <Select
              value={projectFilter}
              onValueChange={onProjectFilterChange}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Project</SelectLabel>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Display counts */}
        <div className="shrink-0 flex items-center gap-2">
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-md px-3 py-1.5 text-sm">
              <Filter className="h-3.5 w-3.5 text-gray-500" />
              <span>{activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          <Badge variant="secondary" className="flex gap-1 items-center py-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{filteredCount} / {totalLeadCount} leads</span>
          </Badge>
          
          {duplicatesCount > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              {duplicatesCount} duplicate{duplicatesCount !== 1 ? 's' : ''} hidden
            </Badge>
          )}
        </div>
      </div>
      
      {/* Status tags to show current filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {searchTerm && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Search: {searchTerm}
            </Badge>
          )}
          
          {statusFilter !== 'all' && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Status: {leadStatusOptions.find(o => o.value === statusFilter)?.label || statusFilter}
            </Badge>
          )}
          
          {projectFilter !== 'all' && !isInProjectContext && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Project: {projects.find(p => p.id === projectFilter)?.name || 'Unknown'}
            </Badge>
          )}
          
          {isInProjectContext && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Project Context Mode
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadFilters;
