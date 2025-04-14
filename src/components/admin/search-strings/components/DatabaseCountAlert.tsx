
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatabaseCountAlertProps {
  rawCount: number | null;
  searchStringsLength: number;
  checkRawSearchStringCount: () => Promise<void>;
  isCountChecking: boolean;
}

const DatabaseCountAlert: React.FC<DatabaseCountAlertProps> = ({
  rawCount,
  searchStringsLength,
  checkRawSearchStringCount,
  isCountChecking
}) => {
  if (rawCount === null) {
    return null;
  }
  
  return (
    <Alert variant={rawCount === 0 ? "destructive" : "default"} className="mb-6">
      <Database className="h-4 w-4" />
      <AlertTitle>Database Search Strings Count</AlertTitle>
      <AlertDescription>
        <p className="font-medium">
          Raw database query found {rawCount} search strings.
          {searchStringsLength !== rawCount && 
           ` There is a discrepancy between raw count (${rawCount}) and loaded strings (${searchStringsLength}).`}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={checkRawSearchStringCount}
          disabled={isCountChecking}
          className="mt-2 flex items-center gap-1"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isCountChecking ? 'animate-spin' : ''}`} />
          Recheck Count
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseCountAlert;
