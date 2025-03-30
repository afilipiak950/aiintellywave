
import { ExcelRow } from '../../../../types/project';
import { Lead, LeadStatus } from '../../../../types/lead';
import { Dialog, DialogContent } from "../../../ui/dialog";
import { useState } from 'react';
import LeadDetailHeader from './detail/components/LeadDetailHeader';
import LeadProfile from './detail/components/LeadProfile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ContactInformation from './detail/components/ContactInformation';
import AdditionalInformation from './detail/components/AdditionalInformation';
import SocialLinks from './detail/components/SocialLinks';
import KeywordTags from './detail/components/KeywordTags';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ResponsiveLeadDetailProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onLeadConverted?: (lead: ExcelRow) => void;
}

const ResponsiveLeadDetail = ({ 
  lead, 
  columns, 
  isOpen, 
  onClose, 
  canEdit, 
  onLeadConverted 
}: ResponsiveLeadDetailProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Transform the ExcelRow structure to match the Lead structure if needed
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
      notes: excelRow.row_data["Notes"] || null,
      last_contact: null,
      score: 0,
      tags: [],
      website: excelRow.row_data["Website"] || null
    };
  };
  
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Header */}
        <LeadDetailHeader lead={lead} />
        
        {/* Profile section */}
        <LeadProfile lead={lead} />
        
        {/* Tabs navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="w-full rounded-none border-b-0 bg-transparent p-0 h-12">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-full"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-full"
              >
                History
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-full"
              >
                Notes
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Overview tab content */}
          <TabsContent value="overview" className="p-6 space-y-6">
            <ContactInformation lead={lead} />
            <AdditionalInformation lead={lead} />
            
            {/* Social Profiles */}
            {lead.row_data["LinkedIn Url"] || lead.row_data["Twitter Url"] || lead.row_data["Facebook Url"] ? (
              <div>
                <h3 className="text-base font-semibold mb-4">Social Profiles</h3>
                <SocialLinks lead={lead} />
              </div>
            ) : null}
            
            {/* Keywords */}
            {lead.row_data["Keywords"] && (
              <div>
                <h3 className="text-base font-semibold mb-4">Keywords</h3>
                <KeywordTags lead={lead} />
              </div>
            )}
          </TabsContent>
          
          {/* History tab content */}
          <TabsContent value="history" className="px-6 py-4">
            <p className="text-gray-400 italic">No history available for this lead.</p>
          </TabsContent>
          
          {/* Notes tab content */}
          <TabsContent value="notes" className="px-6 py-4">
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
        <div className="p-4 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {canEdit && onLeadConverted && (
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
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

export default ResponsiveLeadDetail;
