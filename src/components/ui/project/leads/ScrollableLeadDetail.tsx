
import { ExcelRow } from '../../../../types/project';
import ResponsiveLeadDetail from './ResponsiveLeadDetail';

interface ScrollableLeadDetailProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onLeadConverted?: (lead: ExcelRow) => void;
}

const ScrollableLeadDetail = ({ 
  lead, 
  columns, 
  isOpen, 
  onClose, 
  canEdit, 
  onLeadConverted 
}: ScrollableLeadDetailProps) => {
  return (
    <ResponsiveLeadDetail
      lead={lead}
      columns={columns}
      isOpen={isOpen}
      onClose={onClose}
      canEdit={canEdit}
      onLeadConverted={onLeadConverted}
    />
  );
};

export default ScrollableLeadDetail;
