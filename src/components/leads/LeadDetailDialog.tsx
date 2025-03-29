
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lead } from '@/types/lead';
import { motion, AnimatePresence } from "framer-motion";
import { Building, Linkedin, MapPin, Mail, Phone, Globe, ExternalLink, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
}

const LeadDetailDialog = ({ lead, open, onClose, onUpdate }: LeadDetailDialogProps) => {
  // If no lead, don't render anything
  if (!lead) return null;

  // Get initials for avatar
  const getInitials = () => {
    if (!lead.name) return "??";
    return lead.name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  };

  // Handle lead conversion
  const handleConvert = async () => {
    try {
      const updatedLead = await onUpdate(lead.id, { status: 'qualified' });
      if (updatedLead) {
        toast({
          title: "Lead Converted",
          description: "Successfully converted to candidate",
          variant: "default",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert lead",
        variant: "destructive",
      });
    }
  };
  
  // Get location fields
  const getLocation = () => {
    const city = lead.extra_data?.City || lead.extra_data?.city;
    const country = lead.extra_data?.Country || lead.extra_data?.country;
    
    if (city && country) return `${city}, ${country}`;
    return city || country || lead.extra_data?.Location || lead.extra_data?.location || null;
  };

  // Get company details
  const getCompanyDetails = () => {
    const details = [];
    
    if (lead.extra_data?.Headcount || lead.extra_data?.Employees) {
      details.push({
        label: "Headcount",
        value: lead.extra_data?.Headcount || lead.extra_data?.Employees || "N/A"
      });
    }
    
    if (lead.extra_data?.["Funding Stage"] || lead.extra_data?.Funding) {
      details.push({
        label: "Funding Stage",
        value: lead.extra_data?.["Funding Stage"] || lead.extra_data?.Funding || "N/A"
      });
    }
    
    if (lead.extra_data?.Revenue) {
      details.push({
        label: "Revenue",
        value: lead.extra_data?.Revenue || "N/A"
      });
    }
    
    if (lead.extra_data?.Website) {
      details.push({
        label: "Website",
        value: lead.extra_data?.Website || "N/A",
        isLink: true
      });
    }
    
    return details;
  };

  // Get lead interests and insights
  const getInterests = () => lead.extra_data?.Interests || lead.extra_data?.Keywords || lead.extra_data?.Tags || null;
  const getInsights = () => lead.extra_data?.Insights || lead.notes || null;

  // Get tech stack if available
  const getTechStack = () => {
    const techStackField = lead.extra_data?.["Tech Stack"] || lead.extra_data?.Technologies || null;
    if (!techStackField) return null;
    
    // Parse out individual technologies
    return techStackField.toString().split(/,|;/).map(tech => tech.trim()).filter(Boolean);
  };
  
  // Format website URL for links
  const formatWebsiteUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const linkedInUrl = lead.extra_data?.["LinkedIn Url"] || 
                     lead.extra_data?.["Linkedin Url"] || 
                     lead.extra_data?.linkedin ||
                     null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 h-28 rounded-t-xl" />
          
          {/* Header content */}
          <div className="relative pt-6 px-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <Avatar className="h-16 w-16 rounded-xl border-4 border-white shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xl">
                    {getInitials()}
                  </AvatarFallback>
                  {/* Add AvatarImage here if profile photos become available */}
                </Avatar>
                
                {/* Name and title */}
                <div className="pt-1">
                  <h2 className="text-xl font-bold text-white">{lead.name}</h2>
                  <p className="text-white/90 text-sm">{lead.position} {lead.company && `at ${lead.company}`}</p>
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="text-white/80 text-sm hover:text-white flex items-center mt-1">
                      {lead.email}
                    </a>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2">
                {linkedInUrl && (
                  <a 
                    href={formatWebsiteUrl(linkedInUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0A66C2] p-1.5 rounded-md text-white hover:bg-[#0077b5] transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                <DialogClose className="bg-black/70 p-1.5 rounded-md text-white hover:bg-black/80 transition-colors">
                  <X className="h-5 w-5" />
                </DialogClose>
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
          <div className="bg-gray-50 rounded-t-3xl p-5 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              {/* About Person */}
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                    About {lead.name.split(' ')[0]}
                    <div className="flex space-x-2">
                      {lead.extra_data?.Source === "LinkedIn" && (
                        <Badge variant="secondary" className="bg-blue-100 hover:bg-blue-100 text-blue-800">
                          Scraped from in
                        </Badge>
                      )}
                      {lead.extra_data?.Source === "Twitter" && (
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
              {lead.company && (
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3">About {lead.company}</h3>
                    
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
                    {lead.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-3 text-indigo-500" />
                        <a href={`mailto:${lead.email}`} className="text-gray-800 hover:text-indigo-600">
                          {lead.email}
                        </a>
                      </div>
                    )}
                    
                    {lead.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-3 text-indigo-500" />
                        <a href={`tel:${lead.phone}`} className="text-gray-800 hover:text-indigo-600">
                          {lead.phone}
                        </a>
                      </div>
                    )}
                    
                    {lead.extra_data?.Website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-3 text-indigo-500" />
                        <a 
                          href={formatWebsiteUrl(lead.extra_data.Website as string)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-indigo-600 flex items-center"
                        >
                          {lead.extra_data.Website}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Convert button */}
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleConvert}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                         text-white font-medium px-8 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Convert to Candidate
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;
