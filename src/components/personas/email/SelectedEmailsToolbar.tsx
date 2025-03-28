
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface SelectedEmailsToolbarProps {
  selectedCount: number;
  isBatchAnalyzing: boolean;
  handleAnalyzeSelected: () => Promise<void>;
  handleCreatePersonaFromSelected: () => Promise<void>;
}

export function SelectedEmailsToolbar({
  selectedCount,
  isBatchAnalyzing,
  handleAnalyzeSelected,
  handleCreatePersonaFromSelected
}: SelectedEmailsToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-1">
        <span className="text-sm text-muted-foreground">
          {selectedCount} selected
        </span>
      </div>
      
      {selectedCount > 0 && (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={handleAnalyzeSelected}
            disabled={isBatchAnalyzing}
          >
            {isBatchAnalyzing ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            Analyze Selected
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={handleCreatePersonaFromSelected}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Create Persona
          </Button>
        </div>
      )}
    </div>
  );
}
