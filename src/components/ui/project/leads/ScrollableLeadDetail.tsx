
import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ExcelRow } from '../../../../types/project';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building, ExternalLink, Linkedin, Twitter, Facebook, Globe, MapPin } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
  const getPhone = () => lead?.row_data["Phone"] || "";
  const getWebsite = () => lead?.row_data["Website"] || "";
  const getLocation = () => {
    const city = lead?.row_data["City"] || "";
    const country = lead?.row_data["Country"] || "";
    if (city && country) return `${city}, ${country}`;
    return city || country || "";
  };
  const getIndustry = () => lead?.row_data["Industry"] || "";
  const getLinkedinUrl = () => lead?.row_data["Linkedin Url"] || lead?.row_data["LinkedIn Url"] || "";
  const getTwitterUrl = () => lead?.row_data["Twitter Url"] || lead?.row_data["Twitter"] || "";
  const getFacebookUrl = () => lead?.row_data["Facebook Url"] || lead?.row_data["Facebook"] || "";
  
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
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lead Details</h2>
            <div className="flex gap-2">
              <DialogClose className="opacity-70 hover:opacity-100" />
            </div>
          </div>
        </div>

        {/* Profile section */}
        <div className="p-4 border-b">
          <div className="flex items-center">
            <Avatar className="h-14 w-14 mr-4">
              <AvatarFallback className="bg-blue-500 text-white">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">{getName()}</h2>
                {getLinkedinUrl() && (
                  <a href={getLinkedinUrl()} target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-100 p-1 rounded-full">
                    <Linkedin size={16} />
                  </a>
                )}
                {getTwitterUrl() && (
                  <a href={getTwitterUrl()} target="_blank" rel="noopener noreferrer" className="text-blue-400 bg-blue-100 p-1 rounded-full">
                    <Twitter size={16} />
                  </a>
                )}
                {getFacebookUrl() && (
                  <a href={getFacebookUrl()} target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-100 p-1 rounded-full">
                    <Facebook size={16} />
                  </a>
                )}
              </div>
              <p className="text-gray-600">{getTitle()}</p>
              {getCompany() && (
                <div className="flex items-center text-gray-500 text-sm">
                  <Building className="h-3.5 w-3.5 mr-1" />
                  {getCompany()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">All Details</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          {/* Overview tab content */}
          <TabsContent value="overview" className="px-4 pt-2 pb-4">
            <div className="space-y-6">
              {/* Contact Information Card */}
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-3 text-blue-600">Contact Information</h3>
                <div className="space-y-4">
                  {getEmail() && (
                    <div className="flex items-center text-sm">
                      <span className="text-blue-500 mr-2">📧</span>
                      <a href={`mailto:${getEmail()}`} className="text-blue-600 hover:underline">
                        {getEmail()}
                      </a>
                    </div>
                  )}
                  
                  {getWebsite() && (
                    <div className="flex items-center text-sm">
                      <span className="text-blue-500 mr-2">🌐</span>
                      <a href={getWebsite()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        {getWebsite()}
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  )}
                  
                  {getLocation() && (
                    <div className="flex items-center text-sm">
                      <span className="text-blue-500 mr-2">📍</span>
                      {getLocation()}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Company Information Card */}
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-3 text-blue-600">Company Information</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-gray-500">Company:</span>
                    <span className="col-span-2 font-medium">{getCompany() || "N/A"}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-gray-500">Industry:</span>
                    <span className="col-span-2">{getIndustry() || "N/A"}</span>
                  </div>
                </div>
              </div>
              
              {/* Social Profiles Section */}
              {(getLinkedinUrl() || getTwitterUrl() || getFacebookUrl()) && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-500">Social Profiles</h3>
                  <div className="flex gap-2">
                    {getLinkedinUrl() && (
                      <a
                        href={getLinkedinUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0077B5] text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                      >
                        <Linkedin size={16} className="mr-1.5" /> LinkedIn
                      </a>
                    )}
                    
                    {getTwitterUrl() && (
                      <a
                        href={getTwitterUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1DA1F2] text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                      >
                        <Twitter size={16} className="mr-1.5" /> Twitter
                      </a>
                    )}
                    
                    {getFacebookUrl() && (
                      <a
                        href={getFacebookUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1877F2] text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                      >
                        <Facebook size={16} className="mr-1.5" /> Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* All Details tab content */}
          <TabsContent value="details" className="px-4 pt-2 pb-4">
            <div className="space-y-4">
              {Object.entries(lead.row_data).map(([key, value]) => {
                if (!value) return null;
                
                return (
                  <div key={key} className="border-b pb-2 last:border-0">
                    <p className="text-xs text-gray-500">{key}</p>
                    <p className="font-medium">{value?.toString()}</p>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          {/* Notes tab content */}
          <TabsContent value="notes" className="px-4 pt-2 pb-4">
            <div className="min-h-[100px] bg-gray-50 p-4 rounded-md">
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
              className="bg-purple-600 hover:bg-purple-700"
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
