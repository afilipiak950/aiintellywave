
import { useIsMobile } from '../../../../hooks/use-mobile';
import { ExcelRow } from '../../../../types/project';
import LeadDetailDrawer from "./LeadDetailDrawer";
import LeadDetailDialog from '../../../leads/LeadDetailDialog';

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
    <LeadDetailDialog 
      // Convert ExcelRow format to Lead format
      lead={props.lead ? {
        id: props.lead.id,
        project_id: '', // This will be filled by parent component if needed
        name: props.lead.row_data["Name"] || '',
        email: props.lead.row_data["Email"] || null,
        phone: props.lead.row_data["Phone"] || null,
        company: props.lead.row_data["Company"] || null,
        position: props.lead.row_data["Title"] || null,
        status: (props.lead.row_data["Status"] as any) || 'new',
        notes: props.lead.row_data["Notes"] || null,
        score: Number(props.lead.row_data["Score"] || 0),
        last_contact: props.lead.row_data["Last Contact"] || null,
        tags: null,
        created_at: props.lead.created_at,
        updated_at: props.lead.updated_at,
        extra_data: Object.entries(props.lead.row_data)
          .filter(([key]) => !["Name", "Email", "Phone", "Company", "Title", "Status", "Notes", "Score", "Last Contact"].includes(key))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      } : null}
      open={props.isOpen}
      onClose={props.onClose}
      onUpdate={async () => {
        if (props.onLeadConverted && props.lead) {
          props.onLeadConverted(props.lead);
        }
        return null;
      }}
    />
  );
};

export default ResponsiveLeadDetail;
