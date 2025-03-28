
import { UserPlus, Database, Bug, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadDatabaseActionsProps {
  onCreateClick: () => void;
  onTestDirectLeadCreation: () => void;
  onDebugDatabaseAccess: () => void;
  onForceRefreshLeads: () => void;
}

const LeadDatabaseActions = ({
  onCreateClick,
  onTestDirectLeadCreation,
  onDebugDatabaseAccess,
  onForceRefreshLeads
}: LeadDatabaseActionsProps) => {
  return (
    <div className="flex flex-wrap space-x-2 gap-y-2">
      <Button 
        size="sm" 
        className="bg-gradient-to-r from-indigo-600 to-violet-600"
        onClick={onCreateClick}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Add New Lead
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={onTestDirectLeadCreation}
        className="bg-white/50"
      >
        <Database className="mr-2 h-4 w-4" />
        Debug: Create Test Lead
      </Button>
      
      <Button
        size="sm"
        variant="secondary"
        onClick={onDebugDatabaseAccess}
        className="bg-white/50"
      >
        <Bug className="mr-2 h-4 w-4" />
        Debug DB Access
      </Button>
      
      <Button
        size="sm"
        variant="default"
        onClick={onForceRefreshLeads}
        className="bg-white/50 text-slate-700"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh Leads
      </Button>
    </div>
  );
};

export default LeadDatabaseActions;
