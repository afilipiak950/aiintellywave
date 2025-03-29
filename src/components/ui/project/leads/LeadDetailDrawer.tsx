
import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "../../drawer";
import { ExcelRow } from '../../../../types/project';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, ChevronDown, ChevronUp, Building, Mail, Phone, 
  MapPin, Users, Globe, ExternalLink, Linkedin, Facebook,
  AlertCircle, Clock, Hash, FileText, CreditCard
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
    const linkedinKeys = ["LinkedIn Url", "LinkedIn", "Linkedin Url", "linkedin_url"];
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

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[95vh]">
        <div className="w-full px-0">
          {/* Header with gradient background */}
          <DrawerHeader className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 p-6 text-white">
            <DrawerTitle className="text-white">Lead Details</DrawerTitle>
            
            {linkedInUrl && (
              <motion.a
                href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 mt-2 bg-[#0077B5] rounded-md text-white text-sm hover:bg-[#0077B5]/90"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Linkedin className="h-3 w-3 mr-1" />
                View on LinkedIn
              </motion.a>
            )}
          </DrawerHeader>
          
          {/* Lead profile card with avatar and main info */}
          <div className="p-4 border-b">
            <div className="flex gap-4 items-start">
              <Avatar className="h-16 w-16 rounded-xl border-2 border-white shadow-md bg-gradient-to-br from-indigo-100 to-purple-100">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold">{lead.row_data["Name"]}</h2>
                {lead.row_data["Title"] && (
                  <p className="text-muted-foreground">{lead.row_data["Title"]}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {lead.row_data["Company"] && (
                    <div className="flex items-center text-sm">
                      <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>{lead.row_data["Company"]}</span>
                    </div>
                  )}
                  
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
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 border-b">
              <TabsList className="w-full mb-0">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">All Details</TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="max-h-[calc(95vh-17rem)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="overview" className="m-0 p-4 space-y-6">
                    {/* Contact Information Card */}
                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                      <h3 className="text-base font-semibold mb-3 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-blue-500" />
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        {lead.row_data["Email"] && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                              <Mail className="h-4 w-4 text-blue-500" />
                            </div>
                            <a 
                              href={`mailto:${lead.row_data["Email"]}`} 
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {lead.row_data["Email"]}
                            </a>
                          </div>
                        )}
                        
                        {lead.row_data["Phone"] && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                              <Phone className="h-4 w-4 text-green-500" />
                            </div>
                            <a 
                              href={`tel:${lead.row_data["Phone"]}`} 
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {lead.row_data["Phone"]}
                            </a>
                          </div>
                        )}
                        
                        {lead.row_data["Website"] && (
                          <div className="flex items-center">
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
                          </div>
                        )}
                        
                        {(lead.row_data["Location"] || lead.row_data["City"] || lead.row_data["Country"]) && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                              <MapPin className="h-4 w-4 text-amber-500" />
                            </div>
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
                    
                    {/* Company Information Card (if data available) */}
                    {(lead.row_data["Company"] || lead.row_data["Industry"] || lead.row_data["Company Size"]) && (
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-base font-semibold mb-3 flex items-center">
                          <Building className="h-4 w-4 mr-2 text-indigo-500" />
                          Company Information
                        </h3>
                        <div className="space-y-2">
                          {lead.row_data["Company"] && (
                            <div className="flex items-start">
                              <span className="text-sm text-muted-foreground w-28">Company:</span>
                              <span className="font-medium">{lead.row_data["Company"]}</span>
                            </div>
                          )}
                          
                          {lead.row_data["Industry"] && (
                            <div className="flex items-start">
                              <span className="text-sm text-muted-foreground w-28">Industry:</span>
                              <span>{lead.row_data["Industry"]}</span>
                            </div>
                          )}
                          
                          {lead.row_data["Company Size"] && (
                            <div className="flex items-start">
                              <span className="text-sm text-muted-foreground w-28">Size:</span>
                              <span>{lead.row_data["Company Size"]}</span>
                            </div>
                          )}
                          
                          {lead.row_data["Revenue"] && (
                            <div className="flex items-start">
                              <span className="text-sm text-muted-foreground w-28">Revenue:</span>
                              <span>{lead.row_data["Revenue"]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Key metrics/stats if available */}
                    {(lead.row_data["Score"] || lead.row_data["Last Contact"]) && (
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                          {lead.row_data["Score"] && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Score</p>
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
                  </TabsContent>

                  <TabsContent value="details" className="m-0 p-4">
                    <div className="space-y-6">
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-base font-semibold mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                          All Lead Details
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-y-4">
                          {/* Display ALL fields from the lead.row_data object */}
                          {Object.entries(lead.row_data).map(([key, value]) => (
                            <div key={key} className="border-b pb-3 last:border-0 last:pb-0">
                              <p className="text-xs text-muted-foreground">{key}</p>
                              {typeof value === 'string' && value.length > 150 ? (
                                renderExpandableText(value, key)
                              ) : (
                                <p className="font-medium break-words">{value?.toString() || 'N/A'}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="m-0 p-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold mb-3">Notes</h3>
                      {lead.row_data["Notes"] ? (
                        <div className="bg-slate-50 p-4 rounded-lg border">
                          <p className="whitespace-pre-wrap">{lead.row_data["Notes"] as string}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
                          <p className="text-muted-foreground">No notes available for this lead</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </ScrollArea>
          </Tabs>
          
          <DrawerFooter className="border-t pt-4">
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
