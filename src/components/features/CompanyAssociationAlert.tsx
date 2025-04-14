
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyAssociationAlertProps {
  companyId: string | null;
  loading: boolean;
  onRepair?: () => Promise<void>;
}

export const CompanyAssociationAlert = ({ 
  companyId, 
  loading,
  onRepair 
}: CompanyAssociationAlertProps) => {
  if (companyId || loading) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Company Association Missing</AlertTitle>
      <AlertDescription>
        <p>Your user account is not associated with any company. This may cause features to be unavailable.</p>
        
        {onRepair && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRepair}
              disabled={loading}
            >
              {loading ? 'Repairing...' : 'Repair Account'}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
