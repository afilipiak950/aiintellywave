
import { ExcelRow } from '../../../../types/project';
import { Lead, LeadStatus } from '../../../../types/lead';
import { useLeadConversion } from '../../../../components/leads/detail/hooks/useLeadConversion';
import ScrollableLeadDetail from './ScrollableLeadDetail';

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
      status: "new" as LeadStatus,
      project_id: excelRow.id, // Use the row's ID as project_id
      created_at: excelRow.created_at,
      updated_at: excelRow.updated_at,
      extra_data: excelRow.row_data,
      // Add missing properties required by the Lead type
      notes: excelRow.row_data["Notes"] || null,
      last_contact: null,
      score: 0,
      tags: [],
      website: excelRow.row_data["Website"] || null
    };
  };
  
  const transformedLead = transformToLead(lead);
  
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
