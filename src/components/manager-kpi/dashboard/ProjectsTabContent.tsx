
import React from 'react';

const ProjectsTabContent = ({ kpis, kpisLoading, totalProjects }: { 
  kpis: any[], 
  kpisLoading: boolean,
  totalProjects: number 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">All Projects</h3>
      {kpisLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      ) : kpis.length === 0 ? (
        <p className="text-muted-foreground">No projects data available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* This would ideally fetch real projects data from a separate API call */}
          <div className="border p-4 rounded-lg">
            <h4 className="font-medium text-lg">Project Data</h4>
            <p className="text-gray-500">To display actual projects, implement a separate hook that fetches detailed project information.</p>
          </div>
          
          <div className="border p-4 rounded-lg">
            <h4 className="font-medium">Project Distribution</h4>
            <p className="text-lg font-medium mt-2">
              Total: {totalProjects} projects
            </p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span>Planning:</span>
                <span className="font-medium">{kpis.reduce((sum, user) => sum + Number(user.projects_planning || 0), 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active:</span>
                <span className="font-medium">{kpis.reduce((sum, user) => sum + Number(user.projects_active || 0), 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Completed:</span>
                <span className="font-medium">{kpis.reduce((sum, user) => sum + Number(user.projects_completed || 0), 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsTabContent;
