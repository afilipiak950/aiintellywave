
import { useState, useEffect } from "react";
import { ExcelRow } from '../../../../types/project';
import ScrollableLeadDetail from "./ScrollableLeadDetail";

interface LeadDetailViewProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onLeadConverted?: (lead: ExcelRow) => void;
}

const LeadDetailView = ({ 
  lead, 
  columns, 
  isOpen, 
  onClose, 
  canEdit,
  onLeadConverted
}: LeadDetailViewProps) => {
  // Just pass through to the ScrollableLeadDetail component which now handles both mobile and desktop views
  return (
    <ScrollableLeadDetail
      lead={lead}
      columns={columns}
      isOpen={isOpen}
      onClose={onClose}
      canEdit={canEdit}
      onLeadConverted={onLeadConverted}
    />
  );
};

export default LeadDetailView;
