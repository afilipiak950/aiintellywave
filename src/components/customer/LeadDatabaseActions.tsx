
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadDatabaseActionsProps {
  onCreateClick: () => void;
}

const LeadDatabaseActions = ({
  onCreateClick
}: LeadDatabaseActionsProps) => {
  return (
    <div className="flex flex-wrap space-x-2 gap-y-2">
      <Button 
        size="sm" 
        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
        onClick={onCreateClick}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Add New Lead
      </Button>
    </div>
  );
};

export default LeadDatabaseActions;
