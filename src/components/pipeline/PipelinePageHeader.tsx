
import React from 'react';
import { GitBranch, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';

interface PipelinePageHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  retryCount: number;
  setRetryCount: (count: number) => void;
}

const PipelinePageHeader: React.FC<PipelinePageHeaderProps> = ({
  isRefreshing,
  onRefresh,
  retryCount,
  setRetryCount
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Project Pipeline</h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setRetryCount(0);
            onRefresh();
            toast({
              title: "Refreshing",
              description: "Updating project data..."
            });
          }}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <p className="text-muted-foreground max-w-3xl mb-8">
        Track your projects through different stages. Drag and drop to update project progress.
      </p>
    </>
  );
};

export default PipelinePageHeader;
