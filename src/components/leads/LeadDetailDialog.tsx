
import { useState, useEffect } from 'react';
import { Lead } from '@/types/lead';
import ResponsiveLeadDetail from '@/components/ui/project/leads/ResponsiveLeadDetail';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
}

/**
 * Modern lead detail dialog that adapts between mobile and desktop views
 */
const LeadDetailDialog = ({ lead, open, onClose, onUpdate }: LeadDetailDialogProps) => {
  const [columns, setColumns] = useState<string[]>([]);
  
  useEffect(() => {
    if (lead && lead.extra_data) {
      // Extract all keys from extra_data to use as columns
      setColumns(Object.keys(lead.extra_data || {}));
    }
  }, [lead]);
  
  // If no lead, don't render anything
  if (!lead) return null;

  // Convert the lead to the format expected by our detail components
  const convertedLead = {
    id: lead.id,
    row_data: {
      "Name": lead.name,
      "Email": lead.email || '',
      "Phone": lead.phone || '',
      "Company": lead.company || '',
      "Title": lead.position || '',
      "Status": lead.status,
      "Score": lead.score?.toString() || '0',
      "Last Contact": lead.last_contact || '',
      "Notes": lead.notes || '',
      ...(lead.extra_data || {}), // Spread all extra_data fields
    }
  };

  // Handle lead update
  const handleLeadUpdate = async (updatedLead: any) => {
    if (!lead) return;
    
    // Extract updates from convertedLead format back to Lead format
    const updates: Partial<Lead> = {
      name: updatedLead.row_data["Name"],
      email: updatedLead.row_data["Email"] || null,
      phone: updatedLead.row_data["Phone"] || null,
      company: updatedLead.row_data["Company"] || null, 
      position: updatedLead.row_data["Title"] || null,
      notes: updatedLead.row_data["Notes"] || null,
    };
    
    return await onUpdate(lead.id, updates);
  };

  return (
    <ResponsiveLeadDetail
      lead={convertedLead}
      columns={columns}
      isOpen={open}
      onClose={onClose}
      canEdit={true}
      onLeadConverted={handleLeadUpdate}
    />
  );
};

export default LeadDetailDialog;
