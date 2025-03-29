
import { LeadStatus } from '@/types/lead';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
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
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  projectFilter: string;
  onProjectFilterChange: (value: string) => void;
  projects: Project[];
  totalLeadCount: number;
  filteredCount: number;
}

export const LeadFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  projectFilter,
  onProjectFilterChange,
  projects,
  totalLeadCount,
  filteredCount
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

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleClearFilters = () => {
    onStatusFilterChange('all');
    onProjectFilterChange('all');
  };
  
  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + 
                           (projectFilter !== 'all' ? 1 : 0);

  // Determine if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || projectFilter !== 'all';
  
  return (
    <motion.div 
      className="space-y-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 border shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search leads by name, email, company..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/80 dark:bg-gray-950/80"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="bg-white/80 dark:bg-gray-950/80 flex-shrink-0"
          >
            {activeFilterCount > 0 ? (
              <>
                <Filter className="h-4 w-4 mr-1" />
                Filters
                <Badge variant="secondary" className="ml-1.5 h-5 min-w-[20px] px-1">
                  {activeFilterCount}
                </Badge>
              </>
            ) : (
              <>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
      
      {/* Filter summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Showing {filteredCount} of {totalLeadCount} leads</span>
        </div>
      )}
      
      <AnimatePresence>
        {filtersExpanded && (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-white/80 dark:bg-gray-950/80">
                  {statusOptions.find(option => option.value === statusFilter)?.label || 'All Statuses'}
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      Active Filter
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={onStatusFilterChange}>
                  {statusOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-white/80 dark:bg-gray-950/80">
                  {projectFilter === 'all' 
                    ? 'All Projects' 
                    : (projectFilter === 'unassigned' 
                      ? 'Unassigned' 
                      : projects.find(p => p.id === projectFilter)?.name || 'Select Project')}
                  {projectFilter !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      Active Filter
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                <DropdownMenuRadioGroup value={projectFilter} onValueChange={onProjectFilterChange}>
                  <DropdownMenuRadioItem value="all">All Projects</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unassigned">Unassigned</DropdownMenuRadioItem>
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
      </AnimatePresence>
    </motion.div>
  );
};

export default LeadFilters;
