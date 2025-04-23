
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDatabaseDebug } from '@/hooks/leads/debug/use-database-debug';
import { AlertSection } from './debug/AlertSection';
import { DatabaseStats } from './debug/DatabaseStats';
import { ProjectDebugSection } from './debug/ProjectDebugSection';

interface LeadDatabaseDebugProps {
  debugInfo: any | null;
  onClose: () => void;
  onProjectTest?: (projectId: string) => void;
}

const LeadDatabaseDebug = ({ debugInfo, onClose, onProjectTest }: LeadDatabaseDebugProps) => {
  const [testingProject, setTestingProject] = useState<string | null>(null);
  const { testDirectProjectAccess, loading } = useDatabaseDebug();
  
  if (!debugInfo) return null;
  
  const handleTestProject = async (projectId: string) => {
    setTestingProject(projectId);
    if (onProjectTest) {
      onProjectTest(projectId);
    } else {
      await testDirectProjectAccess(projectId);
    }
    setTestingProject(null);
  };
  
  return (
    <div className="bg-white/80 rounded-lg p-4 border shadow-sm mb-4 overflow-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Database Connection Debug</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {new Date(debugInfo.timestamp || Date.now()).toLocaleTimeString()}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
      
      {debugInfo.status === 'loading' ? (
        <p>Loading debug information...</p>
      ) : debugInfo.status === 'error' ? (
        <AlertSection
          title="Error"
          hasError
        >
          {debugInfo.error}
        </AlertSection>
      ) : (
        <div className="space-y-4 text-sm">
          <AlertSection
            title="Authentication Status"
            isSuccess
          >
            <p>Authenticated as: {debugInfo.auth?.email} (ID: {debugInfo.auth?.userId})</p>
            {debugInfo.auth?.lastSignIn && (
              <p className="text-xs">Last sign in: {new Date(debugInfo.auth.lastSignIn).toLocaleString()}</p>
            )}
          </AlertSection>

          <DatabaseStats 
            connected={debugInfo.database_connection?.connected}
            responseTime={debugInfo.database_connection?.responseTime}
            error={debugInfo.database_connection?.error}
          />

          <ProjectDebugSection
            projects={debugInfo.projects}
            error={debugInfo.projects?.error}
            onTestProject={handleTestProject}
            testingProject={testingProject}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default LeadDatabaseDebug;
