
import { ExcelRow } from '../../../../types/project';
import ScrollableLeadDetail from './ScrollableLeadDetail';

interface ResponsiveLeadDetailProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onLeadConverted?: (lead: ExcelRow) => void;
}

// This component now just passes through to ScrollableLeadDetail
// which handles both desktop and mobile views
const ResponsiveLeadDetail = ({ 
  lead, 
  columns, 
  isOpen, 
  onClose, 
  canEdit, 
  onLeadConverted 
}: ResponsiveLeadDetailProps) => {
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

export default ResponsiveLeadDetail;
