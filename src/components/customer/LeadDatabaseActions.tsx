
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LeadDatabaseActionsProps {
  onCreateClick: () => void;
  totalLeadCount: number;
}

const LeadDatabaseActions = ({
  onCreateClick,
  totalLeadCount
}: LeadDatabaseActionsProps) => {
  return (
    <div className="flex flex-wrap space-x-2 gap-y-2 items-center">
      <Button 
        size="sm" 
        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
        onClick={onCreateClick}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Add New Lead
      </Button>
      <Badge variant="secondary" className="text-xs">
        {totalLeadCount} Leads
      </Badge>
    </div>
  );
};

export default LeadDatabaseActions;
