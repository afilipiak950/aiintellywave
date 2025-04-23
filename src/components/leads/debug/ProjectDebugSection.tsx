
import { Button } from '@/components/ui/button';
import { Database, RefreshCw } from 'lucide-react';
import { AlertSection } from './AlertSection';

interface Project {
  id: string;
  name: string;
  status: string;
}

interface ProjectDebugSectionProps {
  projects?: { count: number; items: Project[] };
  error?: string;
  onTestProject: (projectId: string) => void;
  testingProject: string | null;
  loading: boolean;
}

export const ProjectDebugSection = ({ 
  projects, 
  error, 
  onTestProject,
  testingProject,
  loading
}: ProjectDebugSectionProps) => {
  return (
    <AlertSection
      title={`Projects (${projects?.count || 0})`}
      isSuccess={projects?.count > 0}
      isWarning={!error && (!projects || projects.count === 0)}
    >
      {error ? (
        <p className="text-red-700">Error: {error}</p>
      ) : projects?.count > 0 ? (
        <div>
          <p>Found {projects.count} projects</p>
          <div className="mt-2 max-h-40 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-1 text-left">Name</th>
                  <th className="p-1 text-left">Status</th>
                  <th className="p-1 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.items.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100">
                    <td className="p-1">{project.name}</td>
                    <td className="p-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-xs" 
                        onClick={() => onTestProject(project.id)}
                        disabled={loading || testingProject === project.id}
                      >
                        {testingProject === project.id ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Database className="h-3 w-3 mr-1" />
                        )}
                        Test Access
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-yellow-700">No projects found for your company. Leads are associated with projects.</p>
      )}
    </AlertSection>
  );
};
