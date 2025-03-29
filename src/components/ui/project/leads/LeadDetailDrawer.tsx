
import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "../../drawer";
import { ExcelRow } from '../../../../types/project';
import LeadDetailHeader from "./detail/LeadDetailHeader";
import LeadDetailContent from "./detail/LeadDetailContent";
import LeadDetailFooter from "./detail/LeadDetailFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { Calendar, User } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import { motion } from "framer-motion";

interface LeadDetailDrawerProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onLeadConverted?: (lead: ExcelRow) => void;
}

const LeadDetailDrawer = ({
  lead,
  columns,
  isOpen,
  onClose,
  canEdit,
  onLeadConverted
}: LeadDetailDrawerProps) => {
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
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle>Lead/Candidate Details</DrawerTitle>
          </DrawerHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 border-b">
              <TabsList className="w-full mb-0">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="overflow-y-auto">
              <TabsContent value="overview" className="m-0 p-0">
                <LeadDetailHeader lead={lead} />
                <LeadDetailContent lead={lead} />
              </TabsContent>
              
              <TabsContent value="history" className="m-0">
                <div className="flex items-center justify-center h-48 p-6">
                  <div className="text-center space-y-2">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <h3 className="font-medium">No history available</h3>
                    <p className="text-sm text-muted-foreground">
                      Interaction history will be available in a future update.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notes" className="m-0">
                <div className="flex items-center justify-center h-48 p-6">
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
          
          <DrawerFooter>
            <LeadDetailFooter 
              onClose={onClose} 
              canEdit={canEdit} 
              onConvert={handleConvertLead}
            />
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LeadDetailDrawer;
