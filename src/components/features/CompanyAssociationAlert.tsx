
import React from 'react';

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
  // Always return null to hide this alert completely
  return null;
};
