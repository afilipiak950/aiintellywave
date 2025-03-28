
import { useState, useEffect } from "react";
import { ExcelRow } from '../../../../types/project';
import LeadDetailView from "./LeadDetailView";
import LeadDetailDrawer from "./LeadDetailDrawer";
import { useIsMobile } from '../../../../hooks/use-mobile';

interface ResponsiveLeadDetailProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onLeadConverted?: (lead: ExcelRow) => void;
}

const ResponsiveLeadDetail = (props: ResponsiveLeadDetailProps) => {
  const isMobile = useIsMobile();
  
  return isMobile ? (
    <LeadDetailDrawer {...props} />
  ) : (
    <LeadDetailView {...props} />
  );
};

export default ResponsiveLeadDetail;
