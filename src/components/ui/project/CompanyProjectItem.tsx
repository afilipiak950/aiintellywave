
import React from 'react';
import { User, Calendar } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusColors } from './projectUtils';
import { formatDate } from '@/utils/date-utils';

interface CompanyProjectItemProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    start_date: string | null;
    assignee_avatar?: string | null;
    assignee_name?: string | null;
  };
  onProjectClick: (projectId: string) => void;
}

const CompanyProjectItem = ({ project, onProjectClick }: CompanyProjectItemProps) => {
  return (
    <div key={project.id} className="p-4 hover:bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium text-lg">{project.name}</h4>
          <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
          
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <Badge className={statusColors[project.status] || 'bg-gray-100'}>
              {project.status.replace('_', ' ')}
            </Badge>
            
            {project.start_date && (
              <div className="text-xs text-gray-500 flex items-center">
                <Calendar className="inline h-3 w-3 mr-1" />
                {formatDate(project.start_date)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {project.assignee_avatar ? (
                <img src={project.assignee_avatar} alt={project.assignee_name || ''} />
              ) : (
                <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full">
                  <User className="h-4 w-4" />
                </div>
              )}
            </Avatar>
            <div className="text-sm">
              {project.assignee_name || 'Unassigned'}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onProjectClick(project.id)}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyProjectItem;
