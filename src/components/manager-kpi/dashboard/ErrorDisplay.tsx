
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onRepair?: () => void;
}

const ErrorDisplay = ({ error, onRetry, onRepair }: ErrorDisplayProps) => {
  const [isRepairing, setIsRepairing] = useState(false);
  
  // Determine which troubleshooting tips to show based on the error message
  const showCompanyLinkTips = error.includes('not linked to any company');
  const showAccessTips = error.includes('not enabled for your account');
  const showLoginTips = error.includes('Please log in');
  
  // Attempt automatic repair for company link issues
  const handleAttemptRepair = async () => {
    try {
      setIsRepairing(true);
      
      toast({
        title: "Attempting repair",
        description: "Trying to fix your company association automatically...",
      });
      
      if (onRepair) {
        onRepair();
      } else {
        // If no repair callback provided, retry is the fallback
        if (onRetry) onRetry();
      }
    } catch (err) {
      console.error("Error during repair attempt:", err);
      toast({
        title: "Repair failed",
        description: "Automatic repair failed. Please contact your administrator.",
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };
  
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Manager KPI Dashboard</h1>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      
      <div className="flex justify-center mt-4 gap-3">
        {showCompanyLinkTips && (
          <Button 
            onClick={handleAttemptRepair} 
            variant="default"
            disabled={isRepairing}
          >
            {isRepairing ? "Repairing..." : "Attempt Auto-Repair"}
          </Button>
        )}
        
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline"
            disabled={isRepairing}
          >
            Retry
          </Button>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground mt-6">
        <p className="font-medium">Common solutions:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          {showCompanyLinkTips && (
            <>
              <li>Your user account needs to be linked to a company in the system</li>
              <li>Contact your administrator to ensure you're properly added to a company</li>
              <li>Check if your email address in your profile matches your login email</li>
              <li>Verify you have a manager or admin role assigned in the system</li>
            </>
          )}
          
          {showAccessTips && (
            <>
              <li>Your user account needs the 'manager' or 'admin' role to access this dashboard</li>
              <li>Ask your administrator to enable Manager KPI access for your account</li>
              <li>The Manager KPI feature may need to be enabled for your company</li>
            </>
          )}
          
          {showLoginTips && (
            <>
              <li>Your session may have expired - try logging out and logging back in</li>
              <li>Check if you're logged in with the correct account</li>
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
      
      <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-gray-200">
        <p>Error details: {error}</p>
        <p>If the issue persists after trying the solutions above, please contact support with this error message.</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
