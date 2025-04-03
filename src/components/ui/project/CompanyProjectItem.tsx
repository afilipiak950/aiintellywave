
// src/components/ui/project/CompanyProjectItem.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Badge } from '../badge';
import { MoreVertical, Edit, Copy, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { FormattedDate } from '../formatted-date';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types/project';

interface CompanyProjectItemProps {
  project: Project;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onProjectClick?: (id: string) => void;
}

const CompanyProjectItem: React.FC<CompanyProjectItemProps> = ({ 
  project, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onProjectClick
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onProjectClick) {
      onProjectClick(project.id);
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {project.name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="h-4 w-4 cursor-pointer text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" forceMount onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {onEdit && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(project.id);
              }}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            )}
            {onDuplicate && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onDuplicate(project.id);
              }}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}>
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="/avatars/7.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{project.company_id}</p>
            <p className="text-sm text-muted-foreground">
              Created <FormattedDate date={new Date(project.created_at || '')} />
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Badge variant="secondary">{project.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyProjectItem;
