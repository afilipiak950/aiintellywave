
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';

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
          <Database className="h-4 w-4" />
          <h3 className="text-sm font-medium">Diagnose Informationen</h3>
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-3 text-xs">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-semibold text-red-700 mb-1">Database Error</h4>
              <p className="text-red-600">{error.message}</p>
            </div>
          )}
          
          <div className="p-2">
            <pre className="whitespace-pre-wrap">{JSON.stringify(info, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDatabaseDebug;
