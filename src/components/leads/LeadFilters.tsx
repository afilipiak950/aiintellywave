
import { useState } from 'react';
import { LeadStatus } from '@/types/lead';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
}

interface LeadFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: LeadStatus | 'all';
  onStatusFilterChange: (value: LeadStatus | 'all') => void;
  projectFilter: string | 'all';
  onProjectFilterChange: (value: string | 'all') => void;
  projects: Project[];
}

export const LeadFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  projectFilter,
  onProjectFilterChange,
  projects
}: LeadFiltersProps) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ];
  
  return (
    <motion.div 
      className="space-y-4 bg-white/50 backdrop-blur-sm rounded-xl p-4 border shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/80"
          />
        </div>
        
        {/* Expand/collapse filters button */}
        <Button 
          variant="outline" 
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="bg-white/80"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      {/* Expandable filters */}
      {filtersExpanded && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-white/80">
                {statusOptions.find(option => option.value === statusFilter)?.label || 'All Statuses'}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as LeadStatus | 'all')}>
                {statusOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Project filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-white/80">
                {projectFilter === 'all' 
                  ? 'All Projects' 
                  : projects.find(p => p.id === projectFilter)?.name || 'Select Project'}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
              <DropdownMenuRadioGroup value={projectFilter} onValueChange={onProjectFilterChange}>
                <DropdownMenuRadioItem value="all">All Projects</DropdownMenuRadioItem>
                {projects.map((project) => (
                  <DropdownMenuRadioItem key={project.id} value={project.id}>
                    {project.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LeadFilters;
