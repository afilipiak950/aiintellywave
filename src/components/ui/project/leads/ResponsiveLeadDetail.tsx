
import { useIsMobile } from '../../../../hooks/use-mobile';
import { ExcelRow } from '../../../../types/project';
import LeadDetailDialog from '../../../leads/LeadDetailDialog';
import { Lead } from '../../../../types/lead';

interface ResponsiveLeadDetailProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onLeadConverted?: (lead: ExcelRow) => void;
}

const ResponsiveLeadDetail = ({ lead, columns, isOpen, onClose, canEdit, onLeadConverted }: ResponsiveLeadDetailProps) => {
  // Transform the ExcelRow structure to match the Lead structure
  const transformToLead = (excelRow: ExcelRow): Lead => {
    return {
      id: excelRow.id,
      name: excelRow.row_data["Name"] || 
        `${excelRow.row_data["First Name"] || ''} ${excelRow.row_data["Last Name"] || ''}`.trim() ||
        "Unknown",
      email: excelRow.row_data["Email"] || "",
      phone: excelRow.row_data["Phone"] || "",
      position: excelRow.row_data["Title"] || "",
      company: excelRow.row_data["Company"] || "",
      status: "lead",
      project_id: excelRow.project_id,
      created_at: excelRow.created_at,
      updated_at: excelRow.updated_at,
      social_profiles: [],
      extra_data: excelRow.row_data
    };
  };
  
  const transformedLead = transformToLead(lead);
  
  // Handle lead conversion
  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    if (onLeadConverted) {
      onLeadConverted(lead);
    }
    return transformedLead;
  };
  
  return (
    <LeadDetailDialog
      lead={transformedLead}
      open={isOpen}
      onClose={onClose}
      onUpdate={handleUpdateLead}
    />
  );
};

export default ResponsiveLeadDetail;
