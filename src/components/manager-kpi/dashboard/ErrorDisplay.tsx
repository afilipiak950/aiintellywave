
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Manager KPI Dashboard</h1>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      
      {onRetry && (
        <div className="flex justify-center mt-4">
          <Button onClick={onRetry} variant="outline">
            Retry
          </Button>
        </div>
      )}
      
      <div className="text-sm text-muted-foreground mt-6">
        <p>Common solutions:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Make sure your user account is properly linked to a company</li>
          <li>Verify that you have the correct role (manager or admin) assigned</li>
          <li>Check if the Manager KPI feature is enabled for your company</li>
          <li>Try logging out and logging back in</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorDisplay;
