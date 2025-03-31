
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerErrorStateProps {
  errorMsg: string;
  onRetry: () => void;
}

const CustomerErrorState = ({ errorMsg, onRetry }: CustomerErrorStateProps) => {
  const isRecursionError = errorMsg.includes('recursion') || errorMsg.includes('42P17');

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-2">Error Loading Customers</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{errorMsg}</p>
      
      {isRecursionError ? (
        <div className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 rounded-md mb-4 text-sm text-amber-800 dark:text-amber-200 max-w-md mx-auto">
          <p className="font-medium mb-1">Database Policy Error</p>
          <p>We've encountered a database policy recursion issue. We're working on a fix but you may be able to access the data by trying again.</p>
        </div>
      ) : null}
      
      <Button onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};

export default CustomerErrorState;
