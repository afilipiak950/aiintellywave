
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Search, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onRepair?: () => void;
  diagnosticInfo?: any;
}

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onRepair,
  diagnosticInfo
}: ErrorDisplayProps) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const showCompanyLinkTips = error.includes('not linked to any company');
  const showAccessTips = error.includes('not enabled for your account');
  const showLoginTips = error.includes('Please log in');
  
  const handleAttemptRepair = async () => {
    try {
      toast({
        title: "Attempting repair",
        description: "Trying to fix your company association automatically...",
      });
      
      if (onRepair) {
        onRepair();
      } else if (onRetry) {
        onRetry();
      }
    } catch (err) {
      console.error("Error during repair attempt:", err);
      toast({
        title: "Repair failed",
        description: "Automatic repair failed. Please contact your administrator.",
        variant: "destructive"
      });
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
      
      <div className="flex justify-center mt-4 gap-3 flex-wrap">
        {showCompanyLinkTips && (
          <Button 
            onClick={handleAttemptRepair} 
            variant="default"
          >
            Attempt Auto-Repair
          </Button>
        )}
        
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline"
          >
            Retry
          </Button>
        )}
      </div>
      
      {diagnosticInfo && (
        <div className="mt-6 border rounded p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center">
              <Database className="mr-2 h-4 w-4" />
              Diagnostic Information
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDiagnostics(!showDiagnostics)}
            >
              {showDiagnostics ? "Hide Details" : "Show Details"}
            </Button>
          </div>
          
          {showDiagnostics && diagnosticInfo && (
            <div className="mt-2 text-sm">
              <p><strong>User ID:</strong> {diagnosticInfo.userId}</p>
              <p><strong>User Email:</strong> {diagnosticInfo.userEmail}</p>
              <p><strong>Timestamp:</strong> {diagnosticInfo.timestamp}</p>
              
              <h4 className="font-medium mt-2">Company Associations:</h4>
              {diagnosticInfo.associations?.length > 0 ? (
                <ul className="list-disc pl-5">
                  {diagnosticInfo.associations.map((assoc: any, i: number) => (
                    <li key={i}>
                      Company: {assoc.company_name} ({assoc.company_id}), 
                      Role: {assoc.role}, 
                      KPI Enabled: {assoc.is_manager_kpi_enabled ? 'Yes' : 'No'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-red-500">No company associations found</p>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="text-sm text-muted-foreground mt-6">
        <p className="font-medium">Common solutions:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          {showCompanyLinkTips && (
            <>
              <li>Your user account needs to be linked to a company in the system</li>
              <li>Contact your administrator to ensure you're properly added to Kienbaum or the correct company</li>
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
        </ul>
      </div>
    </div>
  );
};

export default ErrorDisplay;
