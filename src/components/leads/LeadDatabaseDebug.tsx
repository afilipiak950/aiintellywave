
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeadDatabaseDebugProps {
  info: any;
  error: Error | null;
}

const LeadDatabaseDebug = ({ info, error }: LeadDatabaseDebugProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 bg-muted cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          <h3 className="text-sm font-medium">Diagnose Informationen</h3>
          {error && (
            <Badge variant="destructive" className="text-xs">Error</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-3 text-xs">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-semibold text-red-700 mb-1">Error</h4>
              <p className="text-red-600">{error.message}</p>
              {error.stack && (
                <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold mb-1">Authentication</h4>
              <p>
                <span className="inline-block w-32">User authenticated:</span> 
                {info?.isAuthenticated ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="inline-block w-32">User ID:</span> 
                {info?.userId || 'Not available'}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Projects</h4>
              <p>
                <span className="inline-block w-32">Projects found:</span> 
                {info?.projectsFound || 0}
              </p>
              {info?.projectsError && (
                <p className="text-red-500">Error: {info.projectsError}</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Leads Access</h4>
              <p>
                <span className="inline-block w-32">Can access leads:</span> 
                {info?.canAccessLeads ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="inline-block w-32">Leads count:</span> 
                {info?.leadsCount || 0}
              </p>
              {info?.leadsError && (
                <p className="text-red-500">Error: {info.leadsError}</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Raw Diagnostics</h4>
              <pre className="p-2 bg-muted rounded overflow-auto max-h-48">
                {JSON.stringify(info, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDatabaseDebug;
