
import { useIsMobile } from '../../../../hooks/use-mobile';
import { ExcelRow } from '../../../../types/project';
import LeadDetailDrawer from "./LeadDetailDrawer";
import ScrollableLeadDetail from './ScrollableLeadDetail';

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
  
  // For mobile devices, use a bottom drawer
  // For desktop, use the centered modal dialog
  return isMobile ? (
    <LeadDetailDrawer {...props} />
  ) : (
    <ScrollableLeadDetail {...props} />
  );
};

export default ResponsiveLeadDetail;
