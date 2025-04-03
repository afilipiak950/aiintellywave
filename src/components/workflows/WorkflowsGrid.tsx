
import React from 'react';
import { WorkflowCard } from '@/components/workflows/WorkflowCard';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkflowsGridProps {
  workflows: any[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  onView: (workflow: any) => void;
  onEdit: (workflow: any) => void;
  onShare: (workflow: any) => void;
}

export const WorkflowsGrid: React.FC<WorkflowsGridProps> = ({
  workflows,
  isLoading,
  searchTerm,
  onView,
  onEdit,
  onShare
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (workflows?.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        {searchTerm ? 'No workflows match your search.' : 'No workflows found. Sync from n8n to get started.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows?.map((workflow) => (
        <WorkflowCard 
          key={workflow.id}
          workflow={workflow}
          onView={() => onView(workflow)}
          onEdit={() => onEdit(workflow)}
          onShare={() => onShare(workflow)}
        />
      ))}
    </div>
  );
};
