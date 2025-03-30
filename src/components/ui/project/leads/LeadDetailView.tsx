
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../../sheet";
import { ExcelRow } from '../../../../types/project';
import LeadDetailHeader from "./detail/LeadDetailHeader";
import LeadDetailContent from "./detail/LeadDetailContent";
import LeadDetailFooter from "./detail/LeadDetailFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { Calendar, User } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import { motion } from "framer-motion";
import ResponsiveLeadDetail from "./ResponsiveLeadDetail";

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
  // For mobile, use ResponsiveLeadDetail component which is a dialog
  if (window.innerWidth < 640) {
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
  }

  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Reset state when lead changes
  useEffect(() => {
    setActiveTab("overview");
  }, [lead]);
  
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="sm:max-w-md md:max-w-lg lg:max-w-xl p-0 overflow-y-auto">
        <div className="h-full flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle className="text-2xl font-bold">Lead/Candidate Details</SheetTitle>
          </SheetHeader>
        
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="px-6 border-b">
              <TabsList className="w-full justify-start border-b-0 mb-0">
                <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                <TabsTrigger value="history" className="text-sm">History</TabsTrigger>
                <TabsTrigger value="notes" className="text-sm">Notes</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-20">
              <TabsContent value="overview" className="m-0 p-0 h-full">
                <LeadDetailHeader lead={lead} />
                <LeadDetailContent lead={lead} selectedColumn={undefined} />
              </TabsContent>
              
              <TabsContent value="history" className="m-0 h-full">
                <div className="flex items-center justify-center h-full p-6">
                  <div className="text-center space-y-2">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <h3 className="font-medium">No history available</h3>
                    <p className="text-sm text-muted-foreground">
                      Interaction history will be available in a future update.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notes" className="m-0 h-full">
                <div className="flex items-center justify-center h-full p-6">
                  <div className="text-center space-y-2">
                    <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <h3 className="font-medium">No notes available</h3>
                    <p className="text-sm text-muted-foreground">
                      Notes functionality will be available in a future update.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <SheetFooter className="px-6 py-4 border-t absolute bottom-0 left-0 right-0 bg-background">
            <LeadDetailFooter 
              onClose={onClose} 
              canEdit={canEdit} 
              onConvert={handleConvertLead}
            />
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailView;
