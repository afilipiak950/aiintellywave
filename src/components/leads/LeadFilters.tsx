
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import { Project } from '@/types/project';
import { Lead } from '@/types/lead';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  duplicatesCount?: number;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  projectFilter,
  onProjectFilterChange,
  projects,
  totalLeadCount,
  filteredCount,
  duplicatesCount = 0
}) => {
  const { t } = useTranslation();
  
  // Convert statuses to a map with translated values
  const leadStatuses = [
    { value: 'all', label: t('all') },
    { value: 'new', label: t('new') },
    { value: 'contacted', label: t('contacted') },
    { value: 'qualified', label: t('qualified') },
    { value: 'unqualified', label: t('unqualified') },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
  ];
  
  return (
    <div className="rounded-lg border bg-card p-4 my-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <Input 
              placeholder={t('search')} 
              value={searchTerm} 
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-background"
            />
          </div>
          
          <div className="w-full sm:w-40">
            <Select 
              value={statusFilter} 
              onValueChange={onStatusFilterChange}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                {leadStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-48">
            <Select 
              value={projectFilter} 
              onValueChange={onProjectFilterChange}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={t('project')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')} {t('projects')}</SelectItem>
                <SelectItem value="unassigned">{t('unassigned')}</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground w-full md:w-auto">
          <div>
            {t('showing')} <span className="font-medium">{filteredCount}</span> {t('of')} <span className="font-medium">{totalLeadCount}</span> {t('leads')}
            
            {duplicatesCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="ml-2 inline-flex items-center">
                    <Info size={14} className="text-amber-500" />
                    <span className="ml-1 text-amber-600 font-medium">{duplicatesCount} {t('duplicates')} {t('filtered')}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{duplicatesCount} duplicate leads were automatically filtered out based on matching email addresses.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadFilters;
