
import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerClose } from "../../drawer";
import { ExcelRow } from '../../../../types/project';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, ChevronDown, ChevronUp, Building, Mail, Phone, MapPin, Users, 
         Globe, ExternalLink, X, Linkedin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../../../hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

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
  // Get initials for avatar
  const getInitials = () => {
    const name = lead.row_data["Name"] || "";
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
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

  // Get location
  const getLocation = () => {
    const city = lead.row_data["City"];
    const country = lead.row_data["Country"];
    
    if (city && country) return `${city}, ${country}`;
    return city || country || lead.row_data["Location"] || null;
  };

  // Get company details
  const getCompanyDetails = () => {
    const details = [];
    
    if (lead.row_data["Headcount"] || lead.row_data["Employees"]) {
      details.push({
        label: "Headcount",
        value: lead.row_data["Headcount"] || lead.row_data["Employees"] || "N/A"
      });
    }
    
    if (lead.row_data["Funding Stage"] || lead.row_data["Funding"]) {
      details.push({
        label: "Funding Stage",
        value: lead.row_data["Funding Stage"] || lead.row_data["Funding"] || "N/A"
      });
    }
    
    if (lead.row_data["Revenue"]) {
      details.push({
        label: "Revenue",
        value: lead.row_data["Revenue"] || "N/A"
      });
    }
    
    if (lead.row_data["Website"]) {
      details.push({
        label: "Website",
        value: lead.row_data["Website"] || "N/A",
        isLink: true
      });
    }
    
    return details;
  };

  // Get lead interests and insights
  const getInterests = () => lead.row_data["Interests"] || lead.row_data["Keywords"] || lead.row_data["Tags"] || null;
  const getInsights = () => lead.row_data["Insights"] || lead.row_data["Notes"] || null;

  // Get tech stack if available
  const getTechStack = () => {
    const techStackField = lead.row_data["Tech Stack"] || lead.row_data["Technologies"] || null;
    if (!techStackField) return null;
    
    // Parse out individual technologies
    return String(techStackField).split(/,|;/).map(tech => tech.trim()).filter(Boolean);
  };
  
  // Format website URL for links
  const formatWebsiteUrl = (url: string) => {
    if (!url) return '';
    return url.toString().startsWith('http') ? url : `https://${url}`;
  };

  const linkedInUrl = lead.row_data["LinkedIn Url"] || 
                     lead.row_data["Linkedin Url"] || 
                     lead.row_data["linkedin"];

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] p-0">
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 h-28" />
          
          {/* Header content */}
          <div className="relative pt-6 px-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <Avatar className="h-16 w-16 rounded-xl border-4 border-white shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Name and title */}
                <div className="pt-1">
                  <h2 className="text-xl font-bold text-white">{lead.row_data["Name"]}</h2>
                  <p className="text-white/90 text-sm">
                    {lead.row_data["Title"]} {lead.row_data["Company"] && `at ${lead.row_data["Company"]}`}
                  </p>
                  {lead.row_data["Email"] && (
                    <a href={`mailto:${lead.row_data["Email"]}`} className="text-white/80 text-sm hover:text-white flex items-center mt-1">
                      {lead.row_data["Email"]}
                    </a>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2">
                {linkedInUrl && (
                  <a 
                    href={formatWebsiteUrl(linkedInUrl as string)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0A66C2] p-1.5 rounded-md text-white hover:bg-[#0077b5] transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                <DrawerClose className="bg-black/70 p-1.5 rounded-md text-white hover:bg-black/80 transition-colors">
                  <X className="h-5 w-5" />
                </DrawerClose>
              </div>
            </div>
            
            {/* Location */}
            {getLocation() && (
              <div className="flex items-center mt-2 text-white/90">
                <MapPin className="h-4 w-4 mr-1.5 text-white/70" />
                <span className="text-sm">{getLocation()}</span>
              </div>
            )}
          </div>
          
          {/* Content Cards - scrollable */}
          <div className="bg-gray-50 min-h-[calc(100vh-8rem)] rounded-t-3xl p-5 overflow-y-auto">
            <div className="space-y-4 pb-20">
              {/* About Person */}
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                    About {(lead.row_data["Name"] as string).split(' ')[0]}
                    <div className="flex space-x-2">
                      {lead.row_data["Source"] === "LinkedIn" && (
                        <Badge variant="secondary" className="bg-blue-100 hover:bg-blue-100 text-blue-800">
                          Scraped from in
                        </Badge>
                      )}
                      {lead.row_data["Source"] === "Twitter" && (
                        <Badge variant="secondary" className="bg-sky-100 hover:bg-sky-100 text-sky-800">
                          Scraped from X
                        </Badge>
                      )}
                    </div>
                  </h3>
                  
                  {getInterests() && (
                    <div className="mb-3">
                      <p className="font-medium text-sm text-gray-700">Interests:</p>
                      <p className="text-gray-800">{getInterests()}</p>
                    </div>
                  )}
                  
                  {getInsights() && (
                    <div>
                      <p className="font-medium text-sm text-gray-700">Insights:</p>
                      <p className="text-gray-800">{getInsights()}</p>
                    </div>
                  )}
                  
                  {!getInterests() && !getInsights() && (
                    <p className="text-gray-500 italic">No personal details available</p>
                  )}
                </CardContent>
              </Card>
              
              {/* About Company */}
              {lead.row_data["Company"] && (
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3">About {lead.row_data["Company"]}</h3>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      {getCompanyDetails().map((detail, index) => (
                        <div key={index}>
                          <p className="font-medium text-sm text-gray-700">{detail.label}</p>
                          {detail.isLink ? (
                            <a 
                              href={formatWebsiteUrl(detail.value as string)} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 flex items-center"
                            >
                              {detail.value}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          ) : (
                            <p className="text-gray-800">{detail.value}</p>
                          )}
                        </div>
                      ))}
                      
                      {getCompanyDetails().length === 0 && (
                        <p className="text-gray-500 italic col-span-2">No company details available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Tech Stack */}
              {getTechStack() && getTechStack()!.length > 0 && (
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3">Tech Stack</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {getTechStack()!.map((tech, index) => (
                        <div 
                          key={index}
                          className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm 
                                    ${index % 3 === 0 ? 'bg-orange-100' : ''}
                                    ${index % 3 === 1 ? 'bg-blue-100' : ''}
                                    ${index % 3 === 2 ? 'bg-green-100' : ''}
                                    hover:scale-105 transition-transform`}
                        >
                          <span className="font-medium text-xs text-center">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Contact Information */}
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  
                  <div className="space-y-3">
                    {lead.row_data["Email"] && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-3 text-indigo-500" />
                        <a href={`mailto:${lead.row_data["Email"]}`} className="text-gray-800 hover:text-indigo-600">
                          {lead.row_data["Email"]}
                        </a>
                      </div>
                    )}
                    
                    {lead.row_data["Phone"] && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-3 text-indigo-500" />
                        <a href={`tel:${lead.row_data["Phone"]}`} className="text-gray-800 hover:text-indigo-600">
                          {lead.row_data["Phone"]}
                        </a>
                      </div>
                    )}
                    
                    {lead.row_data["Website"] && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-3 text-indigo-500" />
                        <a 
                          href={formatWebsiteUrl(lead.row_data["Website"] as string)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-indigo-600 flex items-center"
                        >
                          {lead.row_data["Website"]}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Convert button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
              <Button 
                onClick={handleConvertLead}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                         text-white font-medium w-full py-2 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Convert to Candidate
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LeadDetailDrawer;
