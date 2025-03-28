
import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../../resizable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../dialog";
import { ExcelRow } from '../../../../types/project';
import LeadDetailSidebar from "./detail/LeadDetailSidebar";
import LeadDetailContent from "./detail/LeadDetailContent";
import LeadDetailFooter from "./detail/LeadDetailFooter";
import { toast } from "../../../../hooks/use-toast";

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
  const [selectedColumn, setSelectedColumn] = useState<string | undefined>(undefined);

  const handleColumnSelect = (column: string) => {
    setSelectedColumn(selectedColumn === column ? undefined : column);
  };
  
  const handleConvertLead = () => {
    if (onLeadConverted) {
      onLeadConverted(lead);
      toast({
        title: "Success",
        description: "Lead has been converted to a candidate successfully",
        variant: "default"
      });
    } else {
      toast({
        title: "Not implemented",
        description: "The convert functionality has not been implemented yet",
        variant: "destructive"
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead/Candidate Details</DialogTitle>
        </DialogHeader>
        
        <ResizablePanelGroup direction="horizontal" className="min-h-[400px]">
          <ResizablePanel defaultSize={30}>
            <LeadDetailSidebar 
              columns={columns} 
              onColumnSelect={handleColumnSelect}
              selectedColumn={selectedColumn}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={70}>
            <LeadDetailContent 
              lead={lead} 
              selectedColumn={selectedColumn}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
        
        <DialogFooter>
          <LeadDetailFooter 
            onClose={onClose} 
            canEdit={canEdit} 
            onConvert={handleConvertLead}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailView;
