
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ErrorDisplayProps {
  error: string;
  errorStatus?: 'no_company' | 'not_manager' | 'kpi_disabled' | 'other' | null;
  onRetry?: () => void;
  onRepair?: () => void;
  diagnosticInfo?: any;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  errorStatus = 'other',
  onRetry, 
  onRepair,
  diagnosticInfo
}) => {
  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Manager KPI Dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="flex gap-4 mt-4">
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                Try Again
              </Button>
            )}
            
            {errorStatus === 'no_company' && onRepair && (
              <Button onClick={onRepair} variant="default">
                Auto-Repair Association
              </Button>
            )}
          </div>
          
          {diagnosticInfo && (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="diagnostic">
                <AccordionTrigger>Diagnostic Information</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-slate-50 p-4 rounded-md overflow-auto max-h-64 text-xs">
                    <div><strong>User ID:</strong> {diagnosticInfo.userId}</div>
                    {diagnosticInfo.userEmail && (
                      <div><strong>User Email:</strong> {diagnosticInfo.userEmail}</div>
                    )}
                    <div><strong>Time:</strong> {diagnosticInfo.timestamp}</div>
                    {diagnosticInfo.associations && (
                      <div className="mt-2">
                        <strong>Company Associations:</strong>
                        <pre className="whitespace-pre-wrap">{
                          diagnosticInfo.associations.length > 0 
                            ? JSON.stringify(diagnosticInfo.associations, null, 2)
                            : 'No associations found'
                        }</pre>
                      </div>
                    )}
                    {diagnosticInfo.rawCompanyUserData && (
                      <div className="mt-2">
                        <strong>Raw Company User Data:</strong>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(diagnosticInfo.rawCompanyUserData, null, 2)}</pre>
                      </div>
                    )}
                    {diagnosticInfo.queryDetails && (
                      <div className="mt-2">
                        <strong>Query Details:</strong>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(diagnosticInfo.queryDetails, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ErrorDisplay;
