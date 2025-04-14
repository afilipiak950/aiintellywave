
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface DebugInfoAlertProps {
  debugInfo: any | null;
}

const DebugInfoAlert: React.FC<DebugInfoAlertProps> = ({ debugInfo }) => {
  if (!debugInfo) {
    return null;
  }
  
  return (
    <Alert variant={debugInfo.error ? "destructive" : "default"} className="mb-6">
      <Info className="h-4 w-4" />
      <AlertTitle>User Debug Information</AlertTitle>
      <AlertDescription className="mt-2">
        {debugInfo.error ? (
          <div className="text-red-500">{debugInfo.error}</div>
        ) : (
          <div className="space-y-2 text-sm">
            <div><span className="font-semibold">User Email:</span> {debugInfo.user?.email}</div>
            <div><span className="font-semibold">User ID:</span> {debugInfo.user?.user_id}</div>
            <div><span className="font-semibold">Company ID:</span> {debugInfo.user?.company_id}</div>
            <div className="font-semibold mt-2">Search Strings Associated:</div>
            <div>Exact matches: {debugInfo.searchStrings?.filter(s => s.user_id === debugInfo.user?.user_id).length || 0}</div>
            <div>Case-insensitive matches: {debugInfo.searchStrings?.length || 0}</div>
            
            {debugInfo.caseInsensitiveMatches && (
              <div className="text-orange-500 font-semibold">
                Found {debugInfo.caseInsensitiveMatches.length} strings with case-sensitivity issues 
                (This suggests a case sensitivity issue with the user ID)
              </div>
            )}
            <div><span className="font-semibold">Auth Account:</span> {debugInfo.authUser ? 'Found' : 'Not Found'}</div>
            <div><span className="font-semibold">Total Search Strings in DB:</span> {debugInfo.allStringsCount}</div>
            
            {debugInfo.searchStrings && debugInfo.searchStrings.length > 0 ? (
              <div>
                <div className="font-semibold mb-1">User's Search Strings:</div>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                  {JSON.stringify(debugInfo.searchStrings.map(s => ({ id: s.id, type: s.type, source: s.input_source })), null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-amber-600">No search strings found with this user ID</div>
            )}
            
            {debugInfo.allStrings && debugInfo.allStrings.length > 0 && (
              <details>
                <summary className="cursor-pointer text-blue-500">Show search strings with ID comparison</summary>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40 mt-1">
                  {JSON.stringify(debugInfo.allStrings, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default DebugInfoAlert;
