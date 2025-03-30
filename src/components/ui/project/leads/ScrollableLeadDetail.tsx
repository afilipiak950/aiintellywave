
import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ExcelRow } from '../../../../types/project';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building, ExternalLink, Mail, MapPin, Globe, Users } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

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

  // Helper functions to extract common fields
  const getName = () => lead?.row_data["Name"] || 
    `${lead?.row_data["First Name"] || ''} ${lead?.row_data["Last Name"] || ''}`.trim() ||
    "Unknown";
  const getInitials = () => {
    const name = getName();
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };
  const getTitle = () => lead?.row_data["Title"] || lead?.row_data["Position"] || "";
  const getCompany = () => lead?.row_data["Company"] || "";
  const getEmail = () => lead?.row_data["Email"] || "";
  const getWebsite = () => lead?.row_data["Website"] || "";
  const getLocation = () => {
    const city = lead?.row_data["City"] || "";
    const state = lead?.row_data["State"] || "";
    const country = lead?.row_data["Country"] || "";
    if (city && country) {
      if (state) return `${city}, ${state}, ${country}`;
      return `${city}, ${country}`;
    }
    return city || state || country || "";
  };
  const getEmployees = () => lead?.row_data["# Employees"] || lead?.row_data["Employees"] || "";
  const getIndustry = () => lead?.row_data["Industry"] || "";
  
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
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 bg-blue-500">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-medium">{getName()}</h2>
                    <p className="text-gray-600">{getTitle()}</p>
                    {getCompany() && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Building className="h-3.5 w-3.5 mr-1" />
                        {getCompany()}
                      </div>
                    )}
                    {getIndustry() && (
                      <div className="text-gray-500 text-sm">
                        {getIndustry()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Second profile section (duplicate) as shown in the image */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 bg-blue-500">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-medium">{getName()}</h2>
                    <p className="text-gray-600">{getTitle()}</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Information Card */}
              <div className="border-t p-4">
                <h3 className="text-sm font-medium mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {getEmail() && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-blue-500 mr-2" />
                      <a href={`mailto:${getEmail()}`} className="text-blue-600 hover:underline">
                        {getEmail()}
                      </a>
                    </div>
                  )}
                  
                  {getLocation() && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                      <span>{getLocation()}</span>
                    </div>
                  )}
                  
                  {getWebsite() && (
                    <div className="flex items-center text-sm">
                      <Globe className="h-4 w-4 text-blue-500 mr-2" />
                      <a href={getWebsite()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        {getWebsite()}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                  
                  {getEmployees() && (
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-blue-500 mr-2" />
                      <span>Employees: {getEmployees()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social Media buttons */}
              <div className="px-4 py-2 flex gap-2">
                {lead.row_data["Twitter"] && (
                  <Button variant="outline" size="sm">Twitter</Button>
                )}
                {lead.row_data["Facebook"] && (
                  <Button variant="outline" size="sm">Facebook</Button>
                )}
              </div>
              
              {/* Additional Information Card */}
              <div className="border-t px-4 py-3">
                <h3 className="text-sm font-medium mb-3">Additional Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {getIndustry() && (
                    <div>
                      <p className="text-xs text-gray-500">Industry</p>
                      <p className="font-medium">{getIndustry()}</p>
                    </div>
                  )}
                  
                  {lead.row_data["Keywords"] && (
                    <div>
                      <p className="text-xs text-gray-500">Keywords</p>
                      <p className="font-medium">{lead.row_data["Keywords"]}</p>
                    </div>
                  )}
                </div>
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
