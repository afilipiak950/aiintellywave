
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../../resizable";
import { Button } from "../../button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../dialog";
import { ExcelRow } from '../../../../types/project';

interface LeadDetailViewProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
}

const LeadDetailView = ({ 
  lead, 
  columns, 
  isOpen, 
  onClose, 
  canEdit 
}: LeadDetailViewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead/Candidate Details</DialogTitle>
        </DialogHeader>
        
        <ResizablePanelGroup direction="horizontal" className="min-h-[400px]">
          <ResizablePanel defaultSize={30}>
            <div className="p-4 space-y-2 font-medium">
              {columns.map((column) => (
                <div key={column} className="cursor-pointer p-2 rounded hover:bg-muted">
                  {column}
                </div>
              ))}
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={70}>
            <div className="p-6 space-y-6">
              {Object.entries(lead.row_data).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">{key}</h3>
                  <p className="text-lg">{value?.toString() || 'N/A'}</p>
                  <div className="border-t border-border pt-2"></div>
                </div>
              ))}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
          {canEdit && (
            <Button variant="outline">
              Convert to Lead
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailView;
