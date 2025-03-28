
import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ExcelRow } from "@/types/project";
import LeadDetailSidebar from './detail/LeadDetailSidebar';
import LeadDetailContent from './detail/LeadDetailContent';
import LeadDetailFooter from '../leads/detail/LeadDetailFooter';

interface LeadDetailViewProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onApprove?: (rowId: string) => void;
}

const LeadDetailView = ({
  lead,
  columns,
  isOpen,
  onClose,
  canEdit,
  onApprove
}: LeadDetailViewProps) => {
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleFieldSelect = (fieldName: string) => {
    setActiveField(fieldName === activeField ? null : fieldName);
  };

  const handleConvertLead = () => {
    if (lead.id && onApprove) {
      onApprove(lead.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        <div className="flex h-[80vh] max-h-[600px]">
          <LeadDetailSidebar 
            lead={lead} 
            columns={columns} 
            activeField={activeField} 
            onFieldSelect={handleFieldSelect} 
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <LeadDetailContent 
              lead={lead} 
              activeField={activeField} 
            />
            
            <div className="p-4 mt-auto">
              <LeadDetailFooter 
                onClose={onClose} 
                canEdit={canEdit} 
                onConvertLead={handleConvertLead}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailView;
