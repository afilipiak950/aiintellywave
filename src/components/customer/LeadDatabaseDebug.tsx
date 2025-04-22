
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, X, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { useDatabaseDebug } from '@/hooks/leads/debug/use-database-debug';
import { useState } from 'react';

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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{debugInfo.error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4 text-sm">
          <Alert className="bg-slate-50">
            <AlertTitle className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" /> Authentication Status
            </AlertTitle>
            <AlertDescription>
              <p>Authenticated as: {debugInfo.auth?.email} (ID: {debugInfo.auth?.userId})</p>
              {debugInfo.auth?.lastSignIn && (
                <p className="text-xs">Last sign in: {new Date(debugInfo.auth.lastSignIn).toLocaleString()}</p>
              )}
            </AlertDescription>
          </Alert>

          {debugInfo.current_route && (
            <Alert className="bg-blue-50">
              <AlertTitle className="flex items-center">
                <AlertCircle className="h-4 w-4 text-blue-500 mr-2" /> Current Path
              </AlertTitle>
              <AlertDescription>
                <p>Current route: <code className="bg-blue-100 px-1 rounded">{debugInfo.current_route}</code></p>
                {debugInfo.current_project_id && (
                  <p>Project ID from route: <code className="bg-blue-100 px-1 rounded">{debugInfo.current_project_id}</code></p>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {debugInfo.current_project && (
            <Alert className={debugInfo.current_project.error ? "bg-red-50" : "bg-green-50"}>
              <AlertTitle className="flex items-center">
                {debugInfo.current_project.error ? (
                  <X className="h-4 w-4 text-red-500 mr-2" />
                ) : (
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                )}
                Current Project
              </AlertTitle>
              <AlertDescription>
                {debugInfo.current_project.error ? (
                  <p className="text-red-700">Error: {debugInfo.current_project.error}</p>
                ) : (
                  <div>
                    <p>Name: {debugInfo.current_project.name}</p>
                    <p>Status: {debugInfo.current_project.status}</p>
                    <p>Company ID: {debugInfo.current_project.company_id}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {debugInfo.current_project_leads && (
            <Alert className={debugInfo.current_project_leads.error ? "bg-red-50" : 
                            debugInfo.current_project_leads.count > 0 ? "bg-green-50" : "bg-yellow-50"}>
              <AlertTitle className="flex items-center">
                {debugInfo.current_project_leads.error ? (
                  <X className="h-4 w-4 text-red-500 mr-2" />
                ) : debugInfo.current_project_leads.count > 0 ? (
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                )}
                Current Project Leads
              </AlertTitle>
              <AlertDescription>
                {debugInfo.current_project_leads.error ? (
                  <p className="text-red-700">Error: {debugInfo.current_project_leads.error}</p>
                ) : debugInfo.current_project_leads.count > 0 ? (
                  <div>
                    <p>Found {debugInfo.current_project_leads.count} leads in this project</p>
                    {debugInfo.current_project_leads.sample && (
                      <div className="mt-1">
                        <p className="font-semibold text-xs">Sample leads:</p>
                        <ul className="list-disc pl-5 mt-1">
                          {debugInfo.current_project_leads.sample.map((lead: any) => (
                            <li key={lead.id}>{lead.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-yellow-700">No leads found in this project</p>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <Alert className={debugInfo.company ? "bg-slate-50" : "bg-red-50"}>
            <AlertTitle className="flex items-center">
              {debugInfo.company ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <X className="h-4 w-4 text-red-500 mr-2" />
              )}
              Company Association
            </AlertTitle>
            <AlertDescription>
              {debugInfo.company?.error ? (
                <div>
                  <p className="text-red-700">Error: {debugInfo.company.error}</p>
                  <p className="text-red-700">Code: {debugInfo.company.code}</p>
                  {debugInfo.company_direct_query && (
                    <div className="mt-2 p-2 bg-white rounded">
                      <p className="font-semibold">Direct Query Result:</p>
                      <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
                        {JSON.stringify(debugInfo.company_direct_query, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : debugInfo.company ? (
                <div>
                  <p>Associated with: {debugInfo.company?.company?.name || 'Unknown'}</p>
                  <p>Role: {debugInfo.company?.role || 'Not specified'}</p>
                  <p>Admin: {debugInfo.company?.is_admin ? 'Yes' : 'No'}</p>
                </div>
              ) : (
                <p className="text-red-700">No company association found. This is required to view leads!</p>
              )}
            </AlertDescription>
          </Alert>
          
          <Alert className={debugInfo.database_connection?.connected ? "bg-green-50" : "bg-red-50"}>
            <AlertTitle className="flex items-center">
              {debugInfo.database_connection?.connected ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <X className="h-4 w-4 text-red-500 mr-2" />
              )}
              Database Connection
            </AlertTitle>
            <AlertDescription>
              {debugInfo.database_connection?.connected ? (
                <div>
                  <p>Database is connected</p>
                  {debugInfo.database_connection.responseTime && (
                    <p>Response time: {debugInfo.database_connection.responseTime}ms</p>
                  )}
                </div>
              ) : (
                <p className="text-red-700">
                  Database connection issue: {debugInfo.database_connection?.error || 'Unknown error'}
                </p>
              )}
            </AlertDescription>
          </Alert>
          
          <Alert className={debugInfo.projects?.count > 0 ? "bg-slate-50" : "bg-yellow-50"}>
            <AlertTitle className="flex items-center">
              {debugInfo.projects?.count > 0 ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              Projects ({debugInfo.projects?.count || 0})
            </AlertTitle>
            <AlertDescription>
              {debugInfo.projects?.error ? (
                <p className="text-red-700">Error: {debugInfo.projects.error}</p>
              ) : debugInfo.projects?.count > 0 ? (
                <div>
                  <p>Found {debugInfo.projects.count} projects</p>
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
                        {debugInfo.projects.items.map((project: any) => (
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
                                onClick={() => handleTestProject(project.id)}
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
            </AlertDescription>
          </Alert>
          
          <Alert className={
            debugInfo.leads?.count > 0 ? "bg-green-50" : 
            debugInfo.leads?.successfulProjectQueries === 0 ? "bg-red-50" : 
            "bg-yellow-50"
          }>
            <AlertTitle className="flex items-center">
              {debugInfo.leads?.count > 0 ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : debugInfo.leads?.successfulProjectQueries === 0 ? (
                <X className="h-4 w-4 text-red-500 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              Project Leads ({debugInfo.leads?.count || 0})
            </AlertTitle>
            <AlertDescription>
              {debugInfo.leads?.count > 0 ? (
                <div>
                  <p>Found {debugInfo.leads.count} leads across {debugInfo.leads.successfulProjectQueries} project(s)</p>
                  {debugInfo.leads.failedProjectQueries > 0 && (
                    <p className="text-yellow-700">Failed to query {debugInfo.leads.failedProjectQueries} project(s)</p>
                  )}
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-1 text-left">Project</th>
                          <th className="p-1 text-left">Leads</th>
                          <th className="p-1 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debugInfo.leads.byProject.map((proj: any) => (
                          <tr key={proj.projectId} className="border-b border-gray-100">
                            <td className="p-1">{proj.projectName}</td>
                            <td className="p-1">{proj.error ? '—' : proj.leadCount}</td>
                            <td className="p-1">
                              {proj.error ? (
                                <span className="text-red-600 text-xs">
                                  Error: {proj.error}
                                </span>
                              ) : proj.leadSample && proj.leadSample.length > 0 ? (
                                <div>
                                  {proj.leadSample.map((lead: any) => (
                                    <div key={lead.id} className="text-xs">
                                      {lead.name || 'Unnamed lead'}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500">No leads</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : debugInfo.leads?.successfulProjectQueries === 0 ? (
                <div>
                  <p className="text-red-700">Failed to query leads from any projects.</p>
                  {debugInfo.leads?.byProject?.[0]?.error && (
                    <div className="mt-2 p-2 bg-white rounded">
                      <p className="font-semibold">Error Sample:</p>
                      <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
                        {debugInfo.leads.byProject[0].error}
                        {debugInfo.leads.byProject[0].errorCode && ` (Code: ${debugInfo.leads.byProject[0].errorCode})`}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-yellow-700">No leads found in any projects. Try importing or creating leads.</p>
              )}
            </AlertDescription>
          </Alert>
          
          <Alert className="bg-slate-50">
            <AlertTitle className="flex items-center">
              RLS Policy Tests
            </AlertTitle>
            <AlertDescription>
              {debugInfo.rls_test ? (
                <div>
                  <p>
                    Projects table: {' '}
                    {debugInfo.rls_test.projects_table?.success ? (
                      <span className="text-green-600">Accessible</span>
                    ) : (
                      <span className="text-red-600">Access denied - {debugInfo.rls_test.projects_table?.error}</span>
                    )}
                  </p>
                  <p>
                    Leads table: {' '}
                    {debugInfo.rls_test.leads_table?.success ? (
                      <span className="text-green-600">Accessible</span>
                    ) : (
                      <span className="text-red-600">Access denied - {debugInfo.rls_test.leads_table?.error}</span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-yellow-700">
                  RLS testing failed: {debugInfo.rls_test?.error || 'Unknown error'}
                </p>
              )}
            </AlertDescription>
          </Alert>
          
          <Alert className="bg-slate-50">
            <AlertTitle className="flex items-center">
              Filter Settings
            </AlertTitle>
            <AlertDescription>
              <dl className="grid grid-cols-2 gap-1">
                <dt className="font-medium">Project Filter:</dt>
                <dd>{debugInfo.filters?.projectFilter || 'all'}</dd>
                
                <dt className="font-medium">Status Filter:</dt>
                <dd>{debugInfo.filters?.statusFilter || 'all'}</dd>
                
                <dt className="font-medium">Search Term:</dt>
                <dd>{debugInfo.filters?.searchTerm || 'none'}</dd>
              </dl>
            </AlertDescription>
          </Alert>
          
          <Alert className="bg-slate-50">
            <AlertTitle className="flex items-center">
              Browser Environment
            </AlertTitle>
            <AlertDescription>
              <p>User Agent: {debugInfo.browser?.userAgent}</p>
              <p>Language: {debugInfo.browser?.language}</p>
              <p>LocalStorage: {debugInfo.browser?.localStorage ? 'Available' : 'Not available'}</p>
              <p>IndexedDB: {debugInfo.browser?.indexedDB ? 'Available' : 'Not available'}</p>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default LeadDatabaseDebug;
