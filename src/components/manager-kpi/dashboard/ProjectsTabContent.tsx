
import React from 'react';
import { useCompanyAllProjects } from '@/hooks/use-company-all-projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/date-utils';
import { Loader2, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth';

const ProjectsTabContent = ({ 
  kpis, 
  kpisLoading, 
  totalProjects,
  companyId 
}: { 
  kpis: any[], 
  kpisLoading: boolean,
  totalProjects: number,
  companyId: string | null
}) => {
  const { projects, loading, error } = useCompanyAllProjects(companyId);
  const { isAdmin } = useAuth();
  
  // Calculate project counts by status
  const projectsByStatus = {
    planning: projects.filter(p => p.status === 'planning').length,
    active: projects.filter(p => ['in_progress', 'review'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  // Determine base URL for project links based on user role
  const projectBaseUrl = isAdmin ? '/admin/projects' : '/manager/projects';
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'planning': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <FileText className="h-4 w-4 text-amber-500" />;
      case 'review': return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'planning': 
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Planning</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
      case 'review':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Review</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Project Distribution</h3>
        {kpisLoading || loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-muted-foreground">Planning</h4>
                  <p className="text-3xl font-bold">{projectsByStatus.planning}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-muted-foreground">Active</h4>
                  <p className="text-3xl font-bold">{projectsByStatus.active}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
                  <p className="text-3xl font-bold">{projectsByStatus.completed}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">All Projects</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading projects...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No projects found for this company.</p>
        ) : (
          <div className="divide-y">
            {projects.map((project) => (
              <div key={project.id} className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(project.status)}
                      <Link to={`${projectBaseUrl}/${project.id}`} className="font-medium hover:underline">
                        {project.name}
                      </Link>
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getStatusBadge(project.status)}
                      {project.start_date && (
                        <span className="text-xs text-muted-foreground">
                          Start: {formatDate(new Date(project.start_date))}
                        </span>
                      )}
                      {project.end_date && (
                        <span className="text-xs text-muted-foreground">
                          End: {formatDate(new Date(project.end_date))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsTabContent;
