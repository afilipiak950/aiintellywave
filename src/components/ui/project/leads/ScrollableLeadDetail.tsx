
import { ExcelRow } from '../../../../types/project';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Linkedin, Twitter, Facebook, Globe } from "lucide-react";
import { useState, useEffect } from "react";

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
  columns, 
  isOpen, 
  onClose, 
  canEdit, 
  onLeadConverted 
}: ScrollableLeadDetailProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Reset state when lead changes
  useEffect(() => {
    setActiveTab("overview");
  }, [lead]);

  // Helper functions to extract data
  const getName = () => lead.row_data["Name"] || 
    (lead.row_data["First Name"] && lead.row_data["Last Name"] ? 
      `${lead.row_data["First Name"]} ${lead.row_data["Last Name"]}` : 
      "Unknown");
  const getTitle = () => lead.row_data["Title"] || "Unknown Position";
  const getCompany = () => lead.row_data["Company"] || "Unknown Company";
  const getEmail = () => lead.row_data["Email"] || "";
  const getWebsite = () => lead.row_data["Website"] || "";
  const getLocation = () => {
    const city = lead.row_data["City"] || "";
    const state = lead.row_data["State"] || "";
    const country = lead.row_data["Country"] || "";
    return [city, state, country].filter(Boolean).join(", ") || "";
  };
  
  // Consistent method to get LinkedIn URL from various possible fields
  const getLinkedinUrl = () => {
    const possibleFields = [
      "Person Linkedin Url",
      "Linkedin Url", 
      "LinkedIn Url", 
      "linkedin_url", 
      "LinkedInURL", 
      "LinkedIn URL", 
      "LinkedIn Profile",
      "linkedin_profile",
      "LinkedIn"
    ];
    
    for (const field of possibleFields) {
      if (lead.row_data[field]) {
        return lead.row_data[field] as string;
      }
    }
    
    return "";
  };
  
  const getTwitterUrl = () => lead.row_data["Twitter Url"] || "";
  const getFacebookUrl = () => lead.row_data["Facebook Url"] || "";
  const getIndustry = () => lead.row_data["Industry"] || "";
  
  // Format URL to ensure it has https://
  const formatUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };
  
  // Get initials for avatar
  const getInitials = () => {
    const name = getName();
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };
  
  // Handle converting lead to candidate
  const handleConvertToCandidate = () => {
    if (onLeadConverted) {
      onLeadConverted(lead);
      toast({
        title: "Success",
        description: "Lead has been converted to a candidate successfully",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Header with social links */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex justify-between items-center"
        >
          <h2 className="text-xl font-semibold">Lead Details</h2>
          
          <div className="flex gap-2">
            {getLinkedinUrl() && (
              <a 
                href={formatUrl(getLinkedinUrl())}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
                title="View LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            
            {getTwitterUrl() && (
              <a 
                href={formatUrl(getTwitterUrl())}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
                title="View Twitter Profile"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            
            {getFacebookUrl() && (
              <a 
                href={formatUrl(getFacebookUrl())}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
                title="View Facebook Profile"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
          </div>
        </motion.div>
        
        {/* Lead Profile Section */}
        <div className="p-4 border-b">
          <div className="flex items-start gap-4">
            <div className="bg-purple-600 text-white rounded-full h-14 w-14 flex items-center justify-center text-xl">
              {getInitials()}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{getName()}</h3>
              <p className="text-gray-600">{getTitle()}</p>
              {getCompany() && <p className="text-gray-500">{getCompany()}</p>}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="w-full justify-start bg-transparent p-0 h-12 rounded-none">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                All Details
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Notes
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content */}
          <div className="overflow-y-auto max-h-[400px] p-4">
            <TabsContent value="overview" className="mt-0">
              {/* Contact Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">Contact Information</h4>
                <div className="space-y-3">
                  {getEmail() && (
                    <div className="flex items-center">
                      <span className="w-6 h-6 mr-2 flex items-center justify-center">📧</span>
                      <a href={`mailto:${getEmail()}`} className="text-blue-600 hover:underline">
                        {getEmail()}
                      </a>
                    </div>
                  )}
                  
                  {getWebsite() && (
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-gray-500" />
                      <a 
                        href={formatUrl(getWebsite())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {getWebsite()}
                      </a>
                    </div>
                  )}
                  
                  {getLocation() && (
                    <div className="flex items-center">
                      <span className="w-6 h-6 mr-2 flex items-center justify-center">📍</span>
                      <span>{getLocation()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Company Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">Company Information</h4>
                <div className="space-y-3">
                  {getCompany() && (
                    <div className="flex items-start">
                      <span className="w-24 text-gray-500">Company:</span>
                      <span className="font-medium">{getCompany()}</span>
                    </div>
                  )}
                  
                  {getIndustry() && (
                    <div className="flex items-start">
                      <span className="w-24 text-gray-500">Industry:</span>
                      <span className="font-medium">{getIndustry()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social Profiles */}
              {(getLinkedinUrl() || getTwitterUrl() || getFacebookUrl()) && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3">Social Profiles</h4>
                  <div className="flex gap-2 flex-wrap">
                    {getLinkedinUrl() && (
                      <a 
                        href={formatUrl(getLinkedinUrl())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-md hover:bg-[#0077B5]/90 transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    
                    {getTwitterUrl() && (
                      <a 
                        href={formatUrl(getTwitterUrl())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-md hover:bg-[#1DA1F2]/90 transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </a>
                    )}
                    
                    {getFacebookUrl() && (
                      <a 
                        href={formatUrl(getFacebookUrl())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-md hover:bg-[#1877F2]/90 transition-colors"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="details" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(lead.row_data).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <p className="text-sm text-gray-500">{key}</p>
                    <p className="font-medium">{value as string}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-0">
              {lead.row_data["Notes"] ? (
                <p className="whitespace-pre-wrap">{lead.row_data["Notes"] as string}</p>
              ) : (
                <p className="text-gray-400 italic">No notes available for this lead.</p>
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        {/* Footer */}
        <div className="border-t p-4 flex justify-end space-x-2 bg-gray-50">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {canEdit && onLeadConverted && (
            <Button 
              onClick={handleConvertToCandidate}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
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
