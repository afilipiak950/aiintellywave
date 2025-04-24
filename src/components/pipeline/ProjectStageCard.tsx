
import { NavLink } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';
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

const ProjectStageCard = ({ id, name, status }: ProjectStageCardProps) => {
  return (
    <Card className="w-full transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h4 className="font-semibold text-sm truncate">{name}</h4>
        <NavLink 
          to={`/customer/projects/${id}`}
          className="text-muted-foreground hover:text-primary"
        >
          <ExternalLink size={16} />
        </NavLink>
      </CardHeader>
      <CardContent>
        <Badge 
          variant="secondary" 
          className={`${statusColors[status]} capitalize`}
        >
          {status}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default ProjectStageCard;
