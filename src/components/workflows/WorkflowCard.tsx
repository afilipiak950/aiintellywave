
import React from 'react';
import { Eye, Edit, Share2, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description?: string;
    tags?: string[];
    is_active: boolean;
  };
  onView: () => void;
  onEdit: () => void;
  onShare: () => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onView,
  onEdit,
  onShare
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{workflow.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {workflow.description || 'No description provided'}
            </CardDescription>
          </div>
          {workflow.is_active ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
          ) : (
            <Badge variant="outline">Inactive</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {workflow.tags && workflow.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {workflow.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tags</p>
        )}
      </CardContent>
      <CardFooter className="pt-3 flex justify-between">
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
