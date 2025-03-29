
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ExcelRow } from '../../../../types/project';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, ChevronDown, ChevronUp, ExternalLink, 
  Facebook, Globe, Linkedin, Mail, MapPin, Phone, Users, X, Hash
} from 'lucide-react';
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
  columns,
  isOpen, 
  onClose, 
  canEdit,
  onLeadConverted 
}: ScrollableLeadDetailProps) => {
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

  // Reset expanded fields when lead changes
  useEffect(() => {
    setExpandedFields({});
  }, [lead]);

  // Helper functions to extract common fields
  const getName = () => lead?.row_data["Name"] || "";
  const getEmail = () => lead?.row_data["Email"] || "";
  const getTitle = () => lead?.row_data["Title"] || "";
  const getCompany = () => lead?.row_data["Company"] || "";
  const getCountry = () => lead?.row_data["Country"] || "";
  const getCity = () => lead?.row_data["City"] || "";
  const getState = () => lead?.row_data["State"] || "";
  const getWebsite = () => lead?.row_data["Website"] || "";
  const getIndustry = () => lead?.row_data["Industry"] || "";
  const getFacebookUrl = () => lead?.row_data["Facebook Url"] || "";
  const getTwitterUrl = () => lead?.row_data["Twitter Url"] || "";
  const getLinkedinUrl = () => lead?.row_data["Linkedin Url"] || lead?.row_data["LinkedIn Url"] || "";
  const getEmployees = () => lead?.row_data["# Employees"] || "";
  const getKeywords = () => lead?.row_data["Keywords"] || "";

  // Get profile photo URL from various possible fields
  const getProfilePhotoUrl = () => {
    if (!lead) return null;
    
    const photoFields = [
      "LinkedIn Photo", "linkedin_photo", "profile_photo", "photo_url", 
      "avatar_url", "photo", "image_url", "headshot_url", "picture"
    ];
    
    for (const field of photoFields) {
      if (lead.row_data[field]) {
        const url = lead.row_data[field] as string;
        if (url && (url.startsWith('http') || url.startsWith('https') || url.startsWith('www.'))) {
          return url;
        }
      }
    }
    
    return null;
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = getName();
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  };

  // Toggle expanded state for text fields
  const toggleExpand = (key: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle link opening
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
    } else {
      toast({
        title: "Not implemented",
        description: "The convert functionality has not been implemented yet",
        variant: "destructive"
      });
    }
    onClose();
  };

  // Format long text fields with expand/collapse
  const renderExpandableText = (text: string, key: string) => {
    if (!text || text.length <= 150) return <p>{text || "N/A"}</p>;
    
    const isExpanded = expandedFields[key];
    
    return (
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          <motion.div 
            initial={{ height: "auto" }}
            animate={{ height: "auto" }}
            exit={{ height: "auto" }}
            className="overflow-hidden"
            transition={{ duration: 0.3 }}
          >
            {isExpanded ? (
              <p>{text}</p>
            ) : (
              <p>{text.substring(0, 150)}...</p>
            )}
          </motion.div>
        </AnimatePresence>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center text-xs p-0 h-auto hover:text-primary transition-colors"
          onClick={() => toggleExpand(key)}
        >
          {isExpanded ? (
            <>Show less <ChevronUp className="ml-1 h-3 w-3" /></>
          ) : (
            <>Read more <ChevronDown className="ml-1 h-3 w-3" /></>
          )}
        </Button>
      </div>
    );
  };

  // Extract background elements for animation
  const BackgroundElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 right-40 w-64 h-64 rounded-full bg-purple-500/5 animate-float blur-3xl"></div>
      <div className="absolute bottom-20 left-40 w-72 h-72 rounded-full bg-blue-500/5 animate-float-delay blur-3xl"></div>
      <div className="absolute top-40 left-20 w-40 h-40 rounded-full bg-indigo-500/5 animate-float-slow blur-3xl"></div>
    </div>
  );

  const photoUrl = getProfilePhotoUrl();
  const linkedInUrl = getLinkedinUrl();

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 max-h-[90vh] overflow-hidden">
        {/* Moving background elements */}
        <BackgroundElements />

        {/* Header with LinkedIn button */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 text-white p-6 relative">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-white">Lead Details</DialogTitle>
            <div className="flex gap-2">
              {linkedInUrl && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenLink(linkedInUrl)}
                  className="bg-[#0077B5] hover:bg-[#0077B5]/90 text-white p-2 rounded-full"
                >
                  <Linkedin className="h-5 w-5" />
                </motion.button>
              )}
              <DialogClose className="rounded-full p-2 hover:bg-white/20 transition">
                <X className="h-5 w-5" />
              </DialogClose>
            </div>
          </div>
        </div>

        {/* Lead profile section */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-xl border-4 border-white shadow-xl">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={`${getName()}'s photo`} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{getName()}</h2>
              {getTitle() && <p className="text-muted-foreground">{getTitle()}</p>}
              {getCompany() && (
                <div className="flex items-center text-sm mt-1">
                  <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>{getCompany()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <ScrollArea className="h-[calc(90vh-12rem)] bg-white/25 transition-all">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Contact Information Card */}
              <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-base font-semibold mb-3 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {getEmail() && (
                    <div className="flex items-center group">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                        <Mail className="h-4 w-4 text-blue-500" />
                      </div>
                      <a 
                        href={`mailto:${getEmail()}`} 
                        className="text-blue-600 hover:text-blue-700 hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        {getEmail()}
                      </a>
                    </div>
                  )}
                  
                  {lead.row_data["Phone"] && (
                    <div className="flex items-center group">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                        <Phone className="h-4 w-4 text-green-500" />
                      </div>
                      <a 
                        href={`tel:${lead.row_data["Phone"]}`} 
                        className="text-blue-600 hover:text-blue-700 hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        {lead.row_data["Phone"]}
                      </a>
                    </div>
                  )}
                  
                  {getWebsite() && (
                    <div className="flex items-center group">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                        <Globe className="h-4 w-4 text-purple-500" />
                      </div>
                      <a 
                        href={getWebsite().startsWith('http') ? getWebsite() : `https://${getWebsite()}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline flex items-center group-hover:translate-x-0.5 transition-transform"
                      >
                        {getWebsite()}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                  
                  {(getCity() || getState() || getCountry()) && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                        <MapPin className="h-4 w-4 text-amber-500" />
                      </div>
                      <span>
                        {[getCity(), getState(), getCountry()].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  
                  {getEmployees() && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <span>Employees: {getEmployees()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social Media Links */}
              {(linkedInUrl || getFacebookUrl() || getTwitterUrl()) && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Social Profiles</h3>
                  <div className="flex gap-2 flex-wrap">
                    {linkedInUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2 hover:bg-[#0077B5]/10"
                        onClick={() => handleOpenLink(linkedInUrl)}
                      >
                        <Linkedin className="h-4 w-4 text-[#0077B5]" />
                        LinkedIn
                      </Button>
                    )}
                    
                    {getTwitterUrl() && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2 hover:bg-[#1DA1F2]/10"
                        onClick={() => handleOpenLink(getTwitterUrl())}
                      >
                        <svg className="h-4 w-4 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Twitter
                      </Button>
                    )}
                    
                    {getFacebookUrl() && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2 hover:bg-[#1877F2]/10"
                        onClick={() => handleOpenLink(getFacebookUrl())}
                      >
                        <Facebook className="h-4 w-4 text-[#1877F2]" />
                        Facebook
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Keywords/Tags */}
              {getKeywords() && (
                <div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Keywords</h3>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getKeywords().split(',').map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="whitespace-nowrap">
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* Right column - All Fields */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="text-base font-semibold mb-3">All Lead Information</h3>
                <div className="grid grid-cols-1 gap-y-4 gap-x-4">
                  {Object.entries(lead.row_data).map(([key, value]) => {
                    if (!value) return null;
                    
                    return (
                      <div key={key} className="space-y-1">
                        <p className="text-xs text-muted-foreground">{key}</p>
                        {typeof value === 'string' && value.length > 150 ? (
                          renderExpandableText(value, key)
                        ) : (
                          <p className="font-medium">{value?.toString() || 'N/A'}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Notes Section - Optional */}
              {lead.row_data["Notes"] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-semibold mb-3">Notes</h3>
                    <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                      <p className="whitespace-pre-wrap">{lead.row_data["Notes"]?.toString()}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </ScrollArea>
        
        {/* Footer with actions - Fixed position */}
        <div className="p-4 border-t bg-white flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {onLeadConverted && (
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
