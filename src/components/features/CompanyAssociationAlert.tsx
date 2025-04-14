
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CompanyAssociationAlertProps {
  companyId: string | null;
  loading: boolean;
}

export const CompanyAssociationAlert = ({ companyId, loading }: CompanyAssociationAlertProps) => {
  if (companyId || loading) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Company Association Missing</AlertTitle>
      <AlertDescription>
        Your user account is not associated with any company. Please contact support to resolve this issue.
      </AlertDescription>
    </Alert>
  );
};
