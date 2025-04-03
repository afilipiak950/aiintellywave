
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => {
  // Determine which troubleshooting tips to show based on the error message
  const showCompanyLinkTips = error.includes('not linked to any company');
  const showAccessTips = error.includes('not enabled for your account');
  const showLoginTips = error.includes('Please log in');
  
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
          {showCompanyLinkTips && (
            <>
              <li>Your user account needs to be linked to a company in the system</li>
              <li>Contact your administrator to ensure you're properly added to a company</li>
              <li>Check if your email address in your profile matches your login email</li>
            </>
          )}
          
          {showAccessTips && (
            <>
              <li>Your user account needs the 'manager' or 'admin' role to access this dashboard</li>
              <li>Ask your administrator to enable Manager KPI access for your account</li>
            </>
          )}
          
          {showLoginTips && (
            <>
              <li>Your session may have expired - try logging out and logging back in</li>
            </>
          )}
          
          {!showCompanyLinkTips && !showAccessTips && !showLoginTips && (
            <>
              <li>Make sure your user account is properly linked to a company</li>
              <li>Verify that you have the correct role (manager or admin) assigned</li>
              <li>Check if the Manager KPI feature is enabled for your company</li>
              <li>Try logging out and logging back in</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ErrorDisplay;
