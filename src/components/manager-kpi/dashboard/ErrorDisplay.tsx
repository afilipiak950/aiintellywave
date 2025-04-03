
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, WrenchIcon, DatabaseIcon, ServerIcon, UserCheckIcon, SettingsIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onRepair?: () => void;
  diagnosticInfo?: any;
  errorStatus?: 'no_company' | 'not_manager' | 'kpi_disabled' | 'other' | null;
}

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onRepair, 
  diagnosticInfo,
  errorStatus = 'other'
}: ErrorDisplayProps) => {
  const isCompanyLinkingError = errorStatus === 'no_company' || error.includes('not linked to any company');
  const isPermissionError = errorStatus === 'not_manager' || error.includes('not have manager permissions');
  const isKpiDisabledError = errorStatus === 'kpi_disabled' || error.includes('KPI feature is not enabled');
  
  const hasRepairOption = !!onRepair && isCompanyLinkingError;
  
  // Function to get a human-readable error title
  const getErrorTitle = () => {
    if (isCompanyLinkingError) return "User-Company Association Error";
    if (isPermissionError) return "Permission Error";
    if (isKpiDisabledError) return "KPI Feature Disabled";
    return "Dashboard Error";
  };
  
  // Function to generate helpful resolution steps based on the error type
  const getResolutionSteps = () => {
    if (isCompanyLinkingError) {
      return (
        <>
          <p className="font-medium text-sm mt-3">Resolution Steps:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Check that your user account exists in the company_users table</li>
            <li>Verify that your company_id is set correctly</li>
            <li>Click "Auto-Repair Association" to attempt automatic repair</li>
          </ol>
        </>
      );
    }
    
    if (isPermissionError) {
      return (
        <>
          <p className="font-medium text-sm mt-3">Resolution Steps:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Ensure your user account has role='manager' in company_users</li>
            <li>Or ensure the is_manager_kpi_enabled flag is set to true</li>
            <li>Contact your administrator to update your permissions</li>
          </ol>
        </>
      );
    }
    
    if (isKpiDisabledError) {
      return (
        <>
          <p className="font-medium text-sm mt-3">Resolution Steps:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Contact your administrator to enable the KPI feature</li>
            <li>Check the is_manager_kpi_enabled setting in your user profile</li>
          </ol>
        </>
      );
    }
    
    return null;
  };
  
  return (
    <div className="p-6 space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-medium">
          {getErrorTitle()}
        </AlertTitle>
        <AlertDescription className="mt-2 text-sm">
          {error}
          {getResolutionSteps()}
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Loading
        </Button>
        
        {hasRepairOption && (
          <Button 
            onClick={onRepair} 
            variant="outline" 
            className="flex items-center gap-2 border-amber-400 hover:bg-amber-50 hover:text-amber-900"
          >
            <WrenchIcon className="h-4 w-4" />
            Auto-Repair Association
          </Button>
        )}
        
        {isPermissionError && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-blue-400 hover:bg-blue-50 hover:text-blue-900"
            onClick={() => window.location.href = "/admin/customers"}
          >
            <UserCheckIcon className="h-4 w-4" />
            Manage User Permissions
          </Button>
        )}
        
        {isKpiDisabledError && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-purple-400 hover:bg-purple-50 hover:text-purple-900"
            onClick={() => window.location.href = "/settings/manager"}
          >
            <SettingsIcon className="h-4 w-4" />
            KPI Settings
          </Button>
        )}
      </div>
      
      {diagnosticInfo && (
        <Accordion type="single" collapsible className="w-full mt-6">
          <AccordionItem value="diagnostics" className="border rounded-md bg-gray-50">
            <AccordionTrigger className="px-4">
              <span className="text-sm font-medium text-gray-600">
                Diagnostic Information
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="bg-white p-4 rounded border text-xs font-mono overflow-x-auto">
                <h4 className="text-sm font-semibold mb-2">User Information:</h4>
                <p>User ID: {diagnosticInfo.userId || 'Not available'}</p>
                <p>Email: {diagnosticInfo.userEmail || 'Not available'}</p>
                <p>Timestamp: {diagnosticInfo.timestamp || new Date().toISOString()}</p>
                
                <h4 className="text-sm font-semibold mt-4 mb-2">Database Query:</h4>
                {diagnosticInfo.queryDetails ? (
                  <div className="bg-gray-100 p-2 rounded">
                    <p>Table: <code>{diagnosticInfo.queryDetails.table || 'company_users'}</code></p>
                    <p>Condition: <code>{diagnosticInfo.queryDetails.condition || 'Not available'}</code></p>
                    <p>Results: <code>{diagnosticInfo.queryDetails.resultCount !== undefined ? diagnosticInfo.queryDetails.resultCount : 'Unknown'}</code></p>
                  </div>
                ) : (
                  <p className="text-gray-500">Query details not available</p>
                )}
                
                <h4 className="text-sm font-semibold mt-4 mb-2">Company Associations:</h4>
                {diagnosticInfo.associations && diagnosticInfo.associations.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnosticInfo.associations.map((assoc: any, idx: number) => (
                      <li key={idx} className="border-b border-gray-100 pb-1 mb-1">
                        <div>Company: <strong>{assoc.companies?.name || 'Unknown'}</strong> (ID: {assoc.company_id || 'N/A'})</div>
                        <div className="text-xs text-gray-600">
                          <span className="mr-2">Role: <code>{assoc.role || 'Unknown'}</code></span>
                          <span className="mr-2">Admin: <code>{assoc.is_admin ? 'Yes' : 'No'}</code></span>
                          <span>KPI Enabled: <code>{assoc.is_manager_kpi_enabled ? 'Yes' : 'No'}</code></span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center bg-red-50 text-red-600 p-2 rounded">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <p>No company associations found.</p>
                  </div>
                )}
                
                <h4 className="text-sm font-semibold mt-4 mb-2">Resolution Steps:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Checkbox id="check-db" />
                    <label htmlFor="check-db" className="text-sm">Verify company_users table has entry with correct user_id and company_id</label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="check-role" />
                    <label htmlFor="check-role" className="text-sm">Confirm user has role='manager' OR is_manager_kpi_enabled=true</label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="check-rls" />
                    <label htmlFor="check-rls" className="text-sm">Check RLS policies allow user to read from company_users table</label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="check-duplicate" />
                    <label htmlFor="check-duplicate" className="text-sm">Check for duplicate company_users entries that might cause conflicts</label>
                  </div>
                </div>
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Raw Diagnostic Data
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                    {JSON.stringify(diagnosticInfo, null, 2)}
                  </pre>
                </details>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default ErrorDisplay;
