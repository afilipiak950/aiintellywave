
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Tool, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  errorStatus?: string | null;
  onRetry: () => void;
  onRepair?: () => void;
  diagnosticInfo?: any;
}

const ErrorDisplay = ({ 
  error, 
  errorStatus = null,
  onRetry, 
  onRepair,
  diagnosticInfo
}: ErrorDisplayProps) => {
  const [showDetails, setShowDetails] = useState(false);

  // Function to determine appropriate error title
  const getErrorTitle = () => {
    switch (errorStatus) {
      case 'no_company':
        return 'Company Association Missing';
      case 'not_manager':
        return 'Missing Manager Permissions';
      case 'kpi_disabled':
        return 'KPI Dashboard Disabled';
      default:
        return 'Dashboard Error';
    }
  };

  // Function to provide human-readable suggestions
  const getSuggestion = () => {
    switch (errorStatus) {
      case 'no_company':
        return 'Try using the "Auto-Repair Association" button to link your account to a company.';
      case 'not_manager':
        return 'Contact your administrator to request manager permissions for this company.';
      case 'kpi_disabled':
        return 'Contact your administrator to enable the Manager KPI dashboard for your account.';
      default:
        return 'Try refreshing the dashboard or contact support if the problem persists.';
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-red-50 p-6 border-b border-red-100">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-red-700">{getErrorTitle()}</h2>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <p className="text-blue-700">{getSuggestion()}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={onRetry} 
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Dashboard
            </Button>
            
            {errorStatus === 'no_company' && onRepair && (
              <Button 
                onClick={onRepair} 
                variant="outline" 
                className="flex items-center"
              >
                <Tool className="mr-2 h-4 w-4" />
                Auto-Repair Association
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="ml-auto flex items-center"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          </div>
          
          {showDetails && diagnosticInfo && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Diagnostic Information</h3>
              <div className="text-xs font-mono text-gray-600 whitespace-pre-wrap">
                <p><strong>User ID:</strong> {diagnosticInfo.userId || 'Unknown'}</p>
                <p><strong>Email:</strong> {diagnosticInfo.userEmail || 'Unknown'}</p>
                <p><strong>Timestamp:</strong> {diagnosticInfo.timestamp || new Date().toISOString()}</p>
                <p><strong>Company Associations:</strong> {(diagnosticInfo.associations?.length || 0)} found</p>
                
                {diagnosticInfo.associations && diagnosticInfo.associations.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Company Details:</p>
                    <ul className="list-disc pl-5 mt-1">
                      {diagnosticInfo.associations.map((assoc: any, index: number) => (
                        <li key={index}>
                          Company: {assoc.companies?.name || 'Unknown'} ({assoc.company_id})
                          <br />
                          Role: {assoc.role || 'Not set'}, 
                          Is Admin: {assoc.is_admin ? 'Yes' : 'No'}, 
                          KPI Enabled: {assoc.is_manager_kpi_enabled ? 'Yes' : 'No'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {diagnosticInfo.queryDetails && (
                  <div className="mt-2">
                    <p className="font-semibold">Query Details:</p>
                    <p>Table: {diagnosticInfo.queryDetails.table}</p>
                    <p>Condition: {diagnosticInfo.queryDetails.condition}</p>
                    <p>Results: {diagnosticInfo.queryDetails.resultCount}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
