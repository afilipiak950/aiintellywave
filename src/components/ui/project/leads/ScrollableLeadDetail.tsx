
import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ExcelRow } from '../../../../types/project';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Mail, Users, Building, Linkedin, Twitter, Facebook, ExternalLink } from "lucide-react";

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
  const getName = () => lead.row_data["Name"] || 
    `${lead.row_data["First Name"] || ''} ${lead.row_data["Last Name"] || ''}`.trim() ||
    "Unknown";
  const getTitle = () => lead.row_data["Title"] || "";
  const getCompany = () => lead.row_data["Company"] || "";
  const getEmail = () => lead.row_data["Email"] || "";
  const getWebsite = () => lead.row_data["Website"] || "";
  const getLocation = () => {
    const city = lead.row_data["City"] || "";
    const state = lead.row_data["State"] || "";
    const country = lead.row_data["Country"] || "";
    return [city, state, country].filter(Boolean).join(", ");
  };
  const getEmployees = () => lead.row_data["# Employees"] || lead.row_data["Employees"] || "";
  const getIndustry = () => lead.row_data["Industry"] || "";
  const getKeywords = () => lead.row_data["Keywords"] || "";
  
  // Social media
  const getLinkedinUrl = () => lead.row_data["LinkedIn Url"] || lead.row_data["Linkedin Url"] || "";
  const getTwitterUrl = () => lead.row_data["Twitter Url"] || "";
  const getFacebookUrl = () => lead.row_data["Facebook Url"] || "";
  
  // Get initials for avatar
  const getInitials = () => {
    const name = getName();
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  };
  
  // Handle opening external links
  const handleOpenLink = (url: string) => {
    if (!url) return;
    
    // Add https if not present
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      fullUrl = 'https://' + url;
    }
    
    window.open(fullUrl, '_blank');
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

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">Lead Details</h2>
          
          <div className="flex gap-2">
            {getLinkedinUrl() && (
              <a 
                href={getLinkedinUrl().startsWith('http') ? getLinkedinUrl() : `https://${getLinkedinUrl()}`}
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
                href={getTwitterUrl().startsWith('http') ? getTwitterUrl() : `https://${getTwitterUrl()}`}
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
                href={getFacebookUrl().startsWith('http') ? getFacebookUrl() : `https://${getFacebookUrl()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
                title="View Facebook Profile"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            
            {getWebsite() && (
              <a 
                href={getWebsite().startsWith('http') ? getWebsite() : `https://${getWebsite()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
                title="Visit Website"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        
        {/* Profile section */}
        <div className="flex items-center gap-4 px-6 py-4 border-b bg-gradient-to-tr from-slate-50 to-white">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{getName()}</h2>
            </div>
            {getTitle() && (
              <p className="text-muted-foreground">{getTitle()}</p>
            )}
            {getCompany() && (
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Building className="h-3.5 w-3.5 mr-1" />
                <span>{getCompany()}</span>
              </div>
            )}
          </div>
        </div>
        
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
            {/* Contact Information Card */}
            <div>
              <h3 className="text-base font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {getEmail() && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-primary mr-3" />
                    <a 
                      href={`mailto:${getEmail()}`} 
                      className="text-primary hover:underline"
                    >
                      {getEmail()}
                    </a>
                  </div>
                )}
                
                {getLocation() && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-3" />
                    <span>{getLocation()}</span>
                  </div>
                )}
                
                {getWebsite() && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-muted-foreground mr-3" />
                    <button 
                      onClick={() => handleOpenLink(getWebsite())}
                      className="text-primary hover:underline flex items-center"
                    >
                      {getWebsite()}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                )}
                
                {getEmployees() && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-muted-foreground mr-3" />
                    <span>Employees: {getEmployees()}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Company Information */}
            {getCompany() && (
              <div>
                <h3 className="text-base font-semibold mb-4">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Company:</div>
                    <div className="font-medium">{getCompany()}</div>
                  </div>
                  
                  {getIndustry() && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Industry:</div>
                      <div className="font-medium">{getIndustry()}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Social Profiles */}
            {(getLinkedinUrl() || getTwitterUrl() || getFacebookUrl()) && (
              <div>
                <h3 className="text-base font-semibold mb-4">Social Profiles</h3>
                <div className="flex flex-wrap gap-2">
                  {getLinkedinUrl() && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => handleOpenLink(getLinkedinUrl())}
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Button>
                  )}
                  
                  {getTwitterUrl() && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => handleOpenLink(getTwitterUrl())}
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Button>
                  )}
                  
                  {getFacebookUrl() && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => handleOpenLink(getFacebookUrl())}
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Additional Information */}
            <div>
              <h3 className="text-base font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(lead.row_data)
                  .filter(([key]) => 
                    !["Name", "First Name", "Last Name", "Email", "Phone", "Title", "Company", 
                      "Country", "State", "City", "Address", "Website", "LinkedIn Url", "Linkedin Url", 
                      "Twitter Url", "Facebook Url", "Notes", "Industry", "# Employees", "Employees",
                      "Keywords"].includes(key))
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{key}</p>
                      <p className="font-medium">{value?.toString() || 'N/A'}</p>
                    </div>
                  ))
                }
              </div>
            </div>
            
            {/* Keywords */}
            {getKeywords() && (
              <div>
                <h3 className="text-base font-semibold mb-4">Keywords</h3>
                <div className="flex flex-wrap gap-1">
                  {getKeywords().split(',').map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="whitespace-nowrap">
                      {keyword.trim()}
                    </Badge>
                  ))}
                </div>
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

export default ScrollableLeadDetail;
