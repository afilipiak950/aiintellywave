
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

// Deutsche Übersetzungen für die Statusanzeige
const statusColors = {
  'in_progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
  'planning': 'bg-amber-100 text-amber-800',
  'review': 'bg-purple-100 text-purple-800'
};

const statusLabels = {
  'in_progress': 'In Bearbeitung',
  'completed': 'Abgeschlossen',
  'cancelled': 'Abgebrochen',
  'planning': 'Planung',
  'review': 'Prüfung'
};

const ProjectStageCard = ({ id, name, status }: ProjectStageCardProps) => {
  // Ensure valid status or fallback to default
  const validStatus = (Object.keys(statusLabels).includes(status) ? status : 'planning') as ProjectStatus;
  
  return (
    <Card className="w-full transition-shadow hover:shadow-md" draggable={true} onDragStart={(e) => {
      e.dataTransfer.setData('projectId', id);
      e.dataTransfer.effectAllowed = 'move';
    }}>
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
          className={`${statusColors[validStatus] || 'bg-gray-100 text-gray-800'}`}
        >
          {statusLabels[validStatus] || status}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default ProjectStageCard;
