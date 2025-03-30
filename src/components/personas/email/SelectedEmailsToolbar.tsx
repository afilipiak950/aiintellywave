
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const onAnalyzeClick = async () => {
    if (selectedCount === 0) {
      toast({
        title: "No Emails Selected",
        description: "Please select at least one email to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    await handleAnalyzeSelected();
  };

  const onCreatePersonaClick = async () => {
    if (selectedCount === 0) {
      toast({
        title: "No Emails Selected",
        description: "Please select at least one email to create a persona.",
        variant: "destructive"
      });
      return;
    }
    
    // The handler now automatically analyzes emails if needed
    await handleCreatePersonaFromSelected();
  };
  
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
            onClick={onAnalyzeClick}
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
            onClick={onCreatePersonaClick}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Update Persona
          </Button>
        </div>
      )}
    </div>
  );
}
