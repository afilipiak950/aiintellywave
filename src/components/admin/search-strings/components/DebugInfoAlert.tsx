
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database } from 'lucide-react';

interface DebugInfoAlertProps {
  debugInfo: any | null;
}

const DebugInfoAlert: React.FC<DebugInfoAlertProps> = ({ debugInfo }) => {
  if (!debugInfo) {
    return null;
  }
  
  return (
    <Alert className="mb-6 bg-yellow-100 border-yellow-400">
      <Database className="h-4 w-4" />
      <AlertTitle>Debug Information</AlertTitle>
      <AlertDescription>
        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200 overflow-auto max-h-96">
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DebugInfoAlert;
