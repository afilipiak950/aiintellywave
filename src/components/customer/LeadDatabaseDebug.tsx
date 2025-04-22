
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, X, AlertCircle } from 'lucide-react';

interface LeadDatabaseDebugProps {
  debugInfo: any | null;
  onClose: () => void;
}

const LeadDatabaseDebug = ({ debugInfo, onClose }: LeadDatabaseDebugProps) => {
  if (!debugInfo) return null;
  
  return (
    <div className="bg-white/80 rounded-lg p-4 border shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Database Connection Debug</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
        >
          Close
        </Button>
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
              Authenticated as: {debugInfo.auth?.email} (ID: {debugInfo.auth?.userId})
            </AlertDescription>
          </Alert>
          
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
              {debugInfo.company ? (
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
              {debugInfo.projects?.count > 0 ? (
                <div>
                  <p>Found {debugInfo.projects.count} projects</p>
                  <ul className="list-disc pl-5 mt-2">
                    {debugInfo.projects.items.map((project: any) => (
                      <li key={project.id}>{project.name} (Status: {project.status})</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-yellow-700">No projects found for your company. Leads are associated with projects.</p>
              )}
            </AlertDescription>
          </Alert>
          
          <Alert className={debugInfo.leads?.count > 0 ? "bg-slate-50" : "bg-yellow-50"}>
            <AlertTitle className="flex items-center">
              {debugInfo.leads?.count > 0 ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              Project Leads ({debugInfo.leads?.count || 0})
            </AlertTitle>
            <AlertDescription>
              {debugInfo.leads?.count > 0 ? (
                <div>
                  <p>Found leads in the following projects:</p>
                  <ul className="list-disc pl-5 mt-2">
                    {debugInfo.leads.byProject.map((proj: any) => (
                      <li key={proj.projectId}>
                        {proj.projectName}: {proj.leadCount || 0} leads
                        {proj.error && <span className="text-red-500 ml-2">Error: {proj.error}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-yellow-700">No leads found in any projects. Try importing or creating leads.</p>
              )}
            </AlertDescription>
          </Alert>
          
          <Alert className={debugInfo.excel_leads?.count > 0 ? "bg-slate-50" : "bg-slate-50"}>
            <AlertTitle className="flex items-center">
              Excel Data ({debugInfo.excel_leads?.count || 0})
            </AlertTitle>
            <AlertDescription>
              {debugInfo.excel_leads?.count > 0 ? (
                <p>Found {debugInfo.excel_leads.count} Excel data rows</p>
              ) : (
                <p>No Excel data found</p>
              )}
              
              {debugInfo.excel_count_check && (
                <div className="mt-2">
                  <p>Excel data by project:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {debugInfo.excel_count_check.map((check: any) => (
                      <li key={check.projectId}>
                        {check.projectName}: {check.excelRowCount || 0} rows
                        {check.error && <span className="text-red-500 ml-2">Error: {check.error}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
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
          
          <Alert className={debugInfo.total_leads_count > 0 ? "bg-green-50" : "bg-yellow-50"}>
            <AlertTitle className="flex items-center">
              {debugInfo.total_leads_count > 0 ? (
                <Check className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              Summary
            </AlertTitle>
            <AlertDescription>
              <p>Total Leads Count: {debugInfo.total_leads_count || 0}</p>
              {debugInfo.total_leads_count === 0 && (
                <div className="mt-2 text-yellow-700">
                  <p className="font-medium">Suggestions:</p>
                  <ul className="list-disc pl-5">
                    <li>Create new leads using the "Add New Lead" button</li>
                    <li>Import leads using the "Import" button</li>
                    <li>Create new projects and add leads to them</li>
                    <li>Contact support if you believe this is an error</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default LeadDatabaseDebug;
