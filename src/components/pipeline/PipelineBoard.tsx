
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import { PipelineProps, PipelineProject } from '../../types/pipeline';
import PipelineColumn from './PipelineColumn';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface PipelineBoardProps extends PipelineProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCompanyId: string | null;
  onFilterChange: (value: string | null) => void;
  companies: { id: string, name: string }[];
  isLoading: boolean;
}

const PipelineBoard: React.FC<PipelineBoardProps> = ({
  stages,
  projects,
  onStageChange,
  searchTerm,
  onSearchChange,
  filterCompanyId,
  onFilterChange,
  companies,
  isLoading
}) => {
  const [draggedProject, setDraggedProject] = useState<PipelineProject | null>(null);

  const handleDragStart = (project: PipelineProject) => {
    setDraggedProject(project);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
  };

  const handleDrop = (stageId: string) => {
    if (draggedProject && draggedProject.stageId !== stageId) {
      onStageChange(draggedProject.id, stageId);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search projects or companies..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Filter by Company</h4>
              <Select
                value={filterCompanyId || ""}
                onValueChange={(value) => onFilterChange(value === "" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading pipeline...</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pb-8 overflow-x-auto"
        >
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              projects={projects.filter(p => p.stageId === stage.id)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={() => handleDrop(stage.id)}
              draggedProject={draggedProject}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default PipelineBoard;
