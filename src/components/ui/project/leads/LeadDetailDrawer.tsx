
import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "../../drawer";
import { ExcelRow } from '../../../../types/project';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar, ChevronDown, ChevronUp, Building, Mail, Phone, 
  MapPin, Users, Globe, ExternalLink, Linkedin, Facebook,
  AlertCircle, Clock, Hash, FileText, CreditCard, Info, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../../../hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../ui/collapsible";
import { cn } from "@/lib/utils";

interface LeadDetailDrawerProps {
  lead: ExcelRow;
  columns: string[];
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  onLeadConverted?: (lead: ExcelRow) => void;
}

// Floating animated elements component
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-16 h-16 bg-indigo-600/10 rounded-full"
        animate={{
          x: [0, 20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{ top: '10%', left: '5%' }}
      />
      <motion.div
        className="absolute w-12 h-12 bg-purple-500/10 rounded-full"
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 20,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{ top: '30%', right: '15%' }}
      />
      <motion.div
        className="absolute w-24 h-24 bg-blue-400/5 rounded-full"
        animate={{
          x: [0, 40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{ bottom: '20%', left: '10%' }}
      />
      <motion.div
        className="absolute w-20 h-20 bg-violet-400/10 rounded-full"
        animate={{
          x: [0, -30, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 18,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 2,
        }}
        style={{ bottom: '30%', right: '10%' }}
      />
    </div>
  );
};

const LeadDetailDrawer = ({
  lead,
  columns,
  isOpen,
  onClose,
  canEdit,
  onLeadConverted
}: LeadDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  
  // Reset state when lead changes
  useEffect(() => {
    setActiveTab("overview");
    setExpandedFields({});
  }, [lead]);
  
  // Get initials for avatar
  const getInitials = () => {
    const name = lead.row_data["Name"] || "";
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

  // Render expanded/collapsed text
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
          className="flex items-center text-xs p-0 h-auto hover:text-blue-500"
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

  // Get LinkedIn URL from multiple possible fields
  const getLinkedInUrl = () => {
    const linkedinKeys = ["LinkedIn Url", "LinkedIn", "Linkedin Url", "linkedin_url", "Linkedin"];
    for (const key of linkedinKeys) {
      if (lead.row_data[key]) return lead.row_data[key] as string;
    }
    return null;
  };

  const linkedInUrl = getLinkedInUrl();

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

  // Group fields for display
  const contactFields = ["Email", "Phone", "Mobile", "LinkedIn", "LinkedIn Url", "Website"];
  const companyFields = ["Company", "Industry", "Company Size", "Revenue", "Funding", "Headcount"];
  const locationFields = ["Location", "City", "State", "Country", "Address"];
  
  // Filter for remaining fields
  const remainingFields = Object.entries(lead.row_data).filter(
    ([key]) => 
      !["Name", "Title", "Status", "Notes", "Score"].includes(key) && 
      !contactFields.includes(key) && 
      !companyFields.includes(key) &&
      !locationFields.includes(key)
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[95vh] sm:max-w-full md:max-w-[800px] lg:max-w-[900px] mx-auto">
        <div className="w-full px-0 relative">
          <FloatingElements />
          
          {/* Header with gradient background */}
          <DrawerHeader className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 p-6 text-white relative z-10">
            <div className="flex justify-between items-start">
              <DrawerTitle className="text-white text-xl md:text-2xl">Lead Details</DrawerTitle>
              
              <div className="flex items-center gap-2">
                {linkedInUrl && (
                  <motion.a
                    href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#0077B5] rounded-md text-white text-sm hover:bg-[#0077B5]/90"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Linkedin className="h-3 w-3 mr-1" />
                    View on LinkedIn
                  </motion.a>
                )}
              </div>
            </div>
          </DrawerHeader>
          
          {/* Lead profile card with avatar and main info */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4 border-b relative z-10"
          >
            <div className="flex gap-4 items-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="h-16 w-16 rounded-xl border-2 border-white shadow-md bg-gradient-to-br from-indigo-100 to-purple-100">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold">{lead.row_data["Name"]}</h2>
                    {lead.row_data["Title"] && (
                      <p className="text-muted-foreground">{lead.row_data["Title"]}</p>
                    )}
                  </div>
                  
                  {lead.row_data["Status"] && (
                    <Badge 
                      variant={(lead.row_data["Status"] as string) === 'new' ? 'default' : 'outline'} 
                      className={cn(
                        "text-xs px-2 py-0.5 capitalize",
                        (lead.row_data["Status"] as string) === 'qualified' && "bg-green-100 text-green-800 border-green-300",
                        (lead.row_data["Status"] as string) === 'contacted' && "bg-blue-100 text-blue-800 border-blue-300",
                      )}
                    >
                      {lead.row_data["Status"]}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {lead.row_data["Company"] && (
                    <div className="flex items-center text-sm">
                      <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>{lead.row_data["Company"]}</span>
                    </div>
                  )}
                  
                  {(lead.row_data["Location"] || lead.row_data["City"] || lead.row_data["Country"]) && (
                    <div className="flex items-center text-sm ml-2">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>
                        {[
                          lead.row_data["Location"], 
                          lead.row_data["City"], 
                          lead.row_data["Country"]
                        ].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 border-b">
              <TabsList className="w-full mb-0">
                <TabsTrigger value="overview" className="flex-1">
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1">
                  <span className="hidden sm:inline">All Details</span>
                  <span className="sm:hidden">Details</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="max-h-[calc(95vh-17rem)] relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="overview" className="m-0 p-4 space-y-6">
                    {/* Two-column grid for main content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column: Contact Information Card */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-6"
                      >
                        <div className="bg-white border rounded-lg p-4 shadow-sm backdrop-blur-sm bg-opacity-80">
                          <h3 className="text-base font-semibold mb-3 flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-blue-500" />
                            Contact Information
                          </h3>
                          <div className="space-y-3">
                            {lead.row_data["Email"] && (
                              <motion.div 
                                className="flex items-center" 
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                                  <Mail className="h-4 w-4 text-blue-500" />
                                </div>
                                <a 
                                  href={`mailto:${lead.row_data["Email"]}`} 
                                  className="text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  {lead.row_data["Email"]}
                                </a>
                              </motion.div>
                            )}
                            
                            {lead.row_data["Phone"] && (
                              <motion.div 
                                className="flex items-center" 
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                                  <Phone className="h-4 w-4 text-green-500" />
                                </div>
                                <a 
                                  href={`tel:${lead.row_data["Phone"]}`} 
                                  className="text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  {lead.row_data["Phone"]}
                                </a>
                              </motion.div>
                            )}
                            
                            {lead.row_data["Website"] && (
                              <motion.div 
                                className="flex items-center" 
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                                  <Globe className="h-4 w-4 text-purple-500" />
                                </div>
                                <a 
                                  href={(lead.row_data["Website"] as string).startsWith('http') ? lead.row_data["Website"] as string : `https://${lead.row_data["Website"]}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 hover:underline flex items-center"
                                >
                                  {lead.row_data["Website"]}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Social Links Card */}
                        {(linkedInUrl || lead.row_data["Facebook Url"] || lead.row_data["Twitter Url"]) && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="bg-white border rounded-lg p-4 shadow-sm backdrop-blur-sm bg-opacity-80"
                          >
                            <h3 className="text-base font-semibold mb-3 flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-blue-500" />
                              Social Profiles
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {linkedInUrl && (
                                <motion.a
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-md hover:bg-[#0077B5]/90 transition-colors"
                                >
                                  <Linkedin className="h-4 w-4" />
                                  LinkedIn
                                </motion.a>
                              )}
                              
                              {lead.row_data["Facebook Url"] && (
                                <motion.a
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  href={(lead.row_data["Facebook Url"] as string).startsWith('http') ? lead.row_data["Facebook Url"] as string : `https://${lead.row_data["Facebook Url"]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-md hover:bg-[#1877F2]/90 transition-colors"
                                >
                                  <Facebook className="h-4 w-4" />
                                  Facebook
                                </motion.a>
                              )}
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Location Information if available */}
                        {locationFields.some(field => lead.row_data[field]) && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="bg-white border rounded-lg p-4 shadow-sm backdrop-blur-sm bg-opacity-80"
                          >
                            <h3 className="text-base font-semibold mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-amber-500" />
                              Location Details
                            </h3>
                            <div className="space-y-2">
                              {locationFields.map(field => lead.row_data[field] && (
                                <div key={field} className="flex items-start">
                                  <span className="text-sm text-muted-foreground w-24">{field}:</span>
                                  <span>{lead.row_data[field]}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Right Column: Company Information Card */}
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="space-y-6"
                      >
                        {/* Company Information if available */}
                        {companyFields.some(field => lead.row_data[field]) && (
                          <div className="bg-white border rounded-lg p-4 shadow-sm backdrop-blur-sm bg-opacity-80">
                            <h3 className="text-base font-semibold mb-3 flex items-center">
                              <Building className="h-4 w-4 mr-2 text-indigo-500" />
                              Company Information
                            </h3>
                            <div className="space-y-2">
                              {companyFields.map(field => lead.row_data[field] && (
                                <div key={field} className="flex items-start">
                                  <span className="text-sm text-muted-foreground w-28">{field}:</span>
                                  <span className="font-medium">{lead.row_data[field]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key metrics/stats if available */}
                        {(lead.row_data["Score"] || lead.row_data["Last Contact"]) && (
                          <div className="bg-white border rounded-lg p-4 shadow-sm backdrop-blur-sm bg-opacity-80">
                            <h3 className="text-base font-semibold mb-3 flex items-center">
                              <Star className="h-4 w-4 mr-2 text-amber-500" />
                              Key Metrics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              {lead.row_data["Score"] && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Lead Score</p>
                                  <div className="flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2 text-amber-500" />
                                    <p className="font-medium">{lead.row_data["Score"]}</p>
                                  </div>
                                </div>
                              )}
                              
                              {lead.row_data["Last Contact"] && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Last Contact</p>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                    <p className="font-medium">{lead.row_data["Last Contact"]}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Additional Info Card - for fields that don't fit in other cards */}
                        {remainingFields.length > 0 && (
                          <Collapsible>
                            <div className="bg-white border rounded-lg p-4 shadow-sm backdrop-blur-sm bg-opacity-80">
                              <CollapsibleTrigger className="flex w-full justify-between items-center">
                                <h3 className="text-base font-semibold flex items-center">
                                  <Info className="h-4 w-4 mr-2 text-violet-500" />
                                  Additional Information
                                </h3>
                                {({ open }) => (
                                  <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "transform rotate-180" : "")} />
                                )}
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent className="mt-3 space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {remainingFields.slice(0, 6).map(([key, value]) => (
                                    <div key={key} className="border-b pb-1.5">
                                      <p className="text-xs text-muted-foreground">{key}</p>
                                      <p>{value?.toString() || 'N/A'}</p>
                                    </div>
                                  ))}
                                </div>
                                
                                {remainingFields.length > 6 && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm" className="w-full mt-2">
                                        View {remainingFields.length - 6} More Fields
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-96 p-4">
                                      <h4 className="font-medium mb-2">Additional Fields</h4>
                                      <ScrollArea className="h-72">
                                        <div className="space-y-2">
                                          {remainingFields.slice(6).map(([key, value]) => (
                                            <div key={key} className="border-b pb-1.5">
                                              <p className="text-xs text-muted-foreground">{key}</p>
                                              <p>{value?.toString() || 'N/A'}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </ScrollArea>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        )}
                      </motion.div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="m-0 p-4">
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white border rounded-lg p-4 shadow-sm backdrop-blur-sm bg-opacity-80">
                          <h3 className="text-base font-semibold mb-3 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                            All Lead Details
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Display ALL fields from the lead.row_data object */}
                            {Object.entries(lead.row_data).map(([key, value]) => (
                              <motion.div 
                                key={key} 
                                className="border-b pb-3 last:border-0 last:pb-0"
                                whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.5)" }}
                                transition={{ duration: 0.2 }}
                              >
                                <p className="text-xs text-muted-foreground">{key}</p>
                                {typeof value === 'string' && value.length > 150 ? (
                                  renderExpandableText(value, key)
                                ) : (
                                  <p className="font-medium break-words">{value?.toString() || 'N/A'}</p>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="m-0 p-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="font-semibold mb-3">Notes</h3>
                      {lead.row_data["Notes"] ? (
                        <motion.div 
                          className="bg-slate-50/70 p-4 rounded-lg border"
                          whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="whitespace-pre-wrap">{lead.row_data["Notes"] as string}</p>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
                          <p className="text-muted-foreground">No notes available for this lead</p>
                        </div>
                      )}
                    </motion.div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </ScrollArea>
          </Tabs>
          
          <DrawerFooter className="border-t pt-4 relative z-10">
            <Button 
              onClick={handleConvertLead}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
            >
              Convert to Candidate
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LeadDetailDrawer;
