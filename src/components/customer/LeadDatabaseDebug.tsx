
import { Button } from '@/components/ui/button';

interface LeadDatabaseDebugProps {
  debugInfo: any | null;
  onClose: () => void;
}

const LeadDatabaseDebug = ({ debugInfo, onClose }: LeadDatabaseDebugProps) => {
  if (!debugInfo) return null;
  
  return (
    <div className="bg-white/80 rounded-lg p-4 border shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Debug Information</h3>
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
        <p className="text-red-500">Error: {debugInfo.error}</p>
      ) : (
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold">Authentication</h4>
            <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.auth, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold">Projects ({debugInfo.projects?.count || 0})</h4>
            <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.projects, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold">Regular Leads ({debugInfo.leads?.count || 0})</h4>
            <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.leads, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold">Excel Leads ({debugInfo.excel_leads?.count || 0})</h4>
            <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.excel_leads, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold">Total Leads Count: {debugInfo.total_leads_count || 0}</h4>
          </div>
          
          {debugInfo.excel_count_check && (
            <div>
              <h4 className="font-semibold">Excel Data Access Check</h4>
              <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(debugInfo.excel_count_check, null, 2)}
              </pre>
            </div>
          )}
          
          {debugInfo.rls && (
            <div>
              <h4 className="font-semibold">RLS Policies</h4>
              <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(debugInfo.rls, null, 2)}
              </pre>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold">Filter Settings</h4>
            <pre className="bg-slate-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.filters, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDatabaseDebug;
