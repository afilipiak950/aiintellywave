
import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import { PipelineProject, PipelineStage } from '../../types/pipeline';
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
import { Button } from "@/components/ui/button";

interface PipelineBoardProps {
  stages: PipelineStage[];
  projects: PipelineProject[];
  onStageChange: (projectId: string, newStageId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCompanyId: string | null;
  onFilterChange: (value: string | null) => void;
  companies: { id: string, name: string }[];
  isLoading: boolean;
  error: string | null;
}

const PipelineBoard: React.FC<PipelineBoardProps> = memo(({
  stages,
  projects,
  onStageChange,
  searchTerm,
  onSearchChange,
  filterCompanyId,
  onFilterChange,
  companies,
  isLoading,
  error
}) => {
  // Handle drag & drop
  const handleDrop = (projectId: string, stageId: string) => {
    onStageChange(projectId, stageId);
  };

  // Error display
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium text-destructive mb-2">Fehler beim Laden der Pipeline</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Projekte suchen..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {companies.length > 1 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Nach Unternehmen filtern</h4>
                <Select
                  value={filterCompanyId || ""}
                  onValueChange={(value) => onFilterChange(value === "" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Unternehmen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle Unternehmen</SelectItem>
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
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pb-8 overflow-x-auto"
      >
        {stages.map(stage => {
          const stageProjects = projects.filter(p => p.stageId === stage.id);
          return (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              projects={stageProjects}
              onDrop={(projectId) => handleDrop(projectId, stage.id)}
            />
          );
        })}
      </motion.div>
    </div>
  );
});

// Add display name for debugging
PipelineBoard.displayName = 'PipelineBoard';

export default PipelineBoard;
