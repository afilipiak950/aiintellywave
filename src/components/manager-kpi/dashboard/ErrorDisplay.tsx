
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, WrenchIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onRepair?: () => void;
  diagnosticInfo?: any;
}

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onRepair, 
  diagnosticInfo 
}: ErrorDisplayProps) => {
  const isCompanyLinkingError = error.includes('not linked to any company');
  const hasRepairOption = !!onRepair && isCompanyLinkingError;
  
  return (
    <div className="p-6 space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-medium">
          {isCompanyLinkingError 
            ? "User-Company Association Error" 
            : "Dashboard Error"}
        </AlertTitle>
        <AlertDescription className="mt-2 text-sm">
          {error}
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
                
                <h4 className="text-sm font-semibold mt-4 mb-2">Company Associations:</h4>
                {diagnosticInfo.associations && diagnosticInfo.associations.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnosticInfo.associations.map((assoc: any, idx: number) => (
                      <li key={idx}>
                        Company: {assoc.companies?.name || assoc.company_id} 
                        (Role: {assoc.role || 'Unknown'}, 
                        KPI Enabled: {assoc.is_manager_kpi_enabled ? 'Yes' : 'No'})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-red-500">No company associations found.</p>
                )}
                
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
