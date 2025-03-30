
import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ExcelRow } from '../../../../types/project';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import LeadProfile from "./detail/components/LeadProfile";
import ContactInformation from "./detail/components/ContactInformation";
import AdditionalInformation from "./detail/components/AdditionalInformation";
import SocialLinks from "./detail/components/SocialLinks";
import KeywordTags from "./detail/components/KeywordTags";

interface ScrollableLeadDetailProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onLeadConverted?: (lead: ExcelRow) => void;
}

const ScrollableLeadDetail = ({ 
  lead, 
  isOpen, 
  onClose, 
  canEdit,
  onLeadConverted 
}: ScrollableLeadDetailProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Handle lead conversion
  const handleConvertLead = () => {
    if (onLeadConverted && lead) {
      onLeadConverted(lead);
      toast({
        title: "Success",
        description: "Lead has been converted to a candidate successfully",
        variant: "default"
      });
    }
    onClose();
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header with title */}
        <div className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lead/Candidate Details</h2>
            <div className="flex gap-2">
              <DialogClose className="opacity-70 hover:opacity-100" />
            </div>
          </div>
        </div>
        
        {/* Tabs navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full rounded-none border-b">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          {/* Overview tab content */}
          <TabsContent value="overview" className="p-0">
            <div className="space-y-4">
              {/* Profile section */}
              <div className="p-4">
                <LeadProfile lead={lead} />
              </div>
              
              {/* Contact Information Card */}
              <div className="px-4">
                <ContactInformation lead={lead} />
              </div>
              
              {/* Social Media buttons */}
              <div className="px-4 py-2">
                <SocialLinks lead={lead} />
              </div>
              
              {/* Keywords */}
              <div className="px-4 py-2">
                <KeywordTags lead={lead} />
              </div>
              
              {/* Additional Information Card */}
              <div className="px-4 pb-4">
                <AdditionalInformation lead={lead} />
              </div>
            </div>
          </TabsContent>
          
          {/* History tab content */}
          <TabsContent value="history" className="px-4 pt-2 pb-4">
            <p className="text-gray-400 italic">No history available for this lead.</p>
          </TabsContent>
          
          {/* Notes tab content */}
          <TabsContent value="notes" className="px-4 pt-2 pb-4">
            <div className="min-h-[100px]">
              {lead.row_data["Notes"] ? (
                <p className="whitespace-pre-wrap">{lead.row_data["Notes"]}</p>
              ) : (
                <p className="text-gray-400 italic">No notes available for this lead.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Footer with actions */}
        <div className="border-t p-3 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {canEdit && onLeadConverted && (
            <Button 
              className="ml-2"
              onClick={handleConvertLead}
            >
              Convert to Candidate
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScrollableLeadDetail;
