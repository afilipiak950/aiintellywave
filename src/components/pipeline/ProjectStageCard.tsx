
import { NavLink } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from '@/utils/project-validations';

interface ProjectStageCardProps {
  id: string;
  name: string;
  status: ProjectStatus;
}

const statusColors = {
  'in_progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
};

const statusLabels = {
  'in_progress': 'In Bearbeitung',
  'completed': 'Abgeschlossen',
  'cancelled': 'Abgebrochen'
};

const ProjectStageCard = ({ id, name, status }: ProjectStageCardProps) => {
  return (
    <NavLink to={`/customer/projects/${id}`}>
      <Card className="w-full transition-all hover:shadow-md">
        <CardContent className="p-4 space-y-3">
          <h4 className="font-medium text-sm truncate">{name}</h4>
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={`${statusColors[status]}`}
            >
              {statusLabels[status]}
            </Badge>
            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ 
                  width: status === 'completed' ? '100%' : 
                         status === 'in_progress' ? '50%' : '0%' 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </NavLink>
  );
};

export default ProjectStageCard;
