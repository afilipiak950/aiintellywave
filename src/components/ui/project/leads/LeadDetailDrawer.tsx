
import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "../../drawer";
import { ExcelRow } from '../../../../types/project';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, ChevronDown, ChevronUp, Building, Mail, Phone, MapPin, Users, Globe, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../../../hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../ui/collapsible";

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
          className="flex items-center text-xs p-0 h-auto"
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

  // Convert lead data for display
  const socialLinks = {
    website: lead.row_data["Website"] || lead.row_data["website"],
    linkedin: lead.row_data["LinkedIn"] || lead.row_data["linkedin"],
    facebook: lead.row_data["Facebook"] || lead.row_data["facebook"],
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

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="max-w-md mx-auto w-full px-0">
          <DrawerHeader className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
            <DrawerTitle className="text-white">Lead/Candidate Details</DrawerTitle>
          </DrawerHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 border-b">
              <TabsList className="w-full mb-0">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-14rem)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="overview" className="m-0 p-0">
                    {/* Lead Profile Section */}
                    <div className="flex gap-4 p-6 border-b">
                      <Avatar className="h-16 w-16 rounded-full border-2 border-primary/20 ring-2 ring-white">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{lead.row_data["Name"]}</h2>
                        {lead.row_data["Title"] && (
                          <p className="text-muted-foreground">{lead.row_data["Title"]}</p>
                        )}
                        {lead.row_data["Company"] && (
                          <div className="flex items-center mt-1">
                            <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-sm font-medium">{lead.row_data["Company"]}</span>
                          </div>
                        )}
                        
                        {/* Industry Badge */}
                        {lead.row_data["Industry"] && (
                          <Badge variant="outline" className="mt-2">
                            {lead.row_data["Industry"]}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="p-6 border-b">
                      <h3 className="font-semibold mb-3">Contact Information</h3>
                      <div className="space-y-3">
                        {lead.row_data["Email"] && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-3 text-indigo-500" />
                            <a href={`mailto:${lead.row_data["Email"]}`} className="hover:underline text-indigo-600">
                              {lead.row_data["Email"]}
                            </a>
                          </div>
                        )}
                        
                        {lead.row_data["Phone"] && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-3 text-indigo-500" />
                            <a href={`tel:${lead.row_data["Phone"]}`} className="hover:underline text-indigo-600">
                              {lead.row_data["Phone"]}
                            </a>
                          </div>
                        )}
                        
                        {lead.row_data["Location"] && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-3 text-indigo-500" />
                            <span>{lead.row_data["Location"]}</span>
                          </div>
                        )}
                        
                        {lead.row_data["Employees"] && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-3 text-indigo-500" />
                            <span>Employees: {lead.row_data["Employees"]}</span>
                          </div>
                        )}
                        
                        {socialLinks.website && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-3 text-indigo-500" />
                            <a 
                              href={socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline text-indigo-600 flex items-center"
                            >
                              {socialLinks.website}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Lead Details */}
                    <div className="p-6 border-b">
                      <h3 className="font-semibold mb-3">Additional Information</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge 
                            variant={lead.row_data["Status"] === 'new' ? 'default' : 'outline'} 
                            className="mt-1 capitalize"
                          >
                            {lead.row_data["Status"] || 'New'}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p>{lead.row_data["Score"] || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Last Contact</p>
                          <p>{lead.row_data["Last Contact"] || 'N/A'}</p>
                        </div>
                        
                        {lead.row_data["Notes"] && (
                          <div>
                            <p className="text-sm text-muted-foreground">Notes</p>
                            {renderExpandableText(lead.row_data["Notes"] as string, 'notes')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Extra Data Fields */}
                    <div className="p-6 border-b">
                      <h3 className="font-semibold mb-3">Other Information</h3>
                      <div className="space-y-4">
                        {Object.entries(lead.row_data)
                          .filter(([key]) => !["Name", "Email", "Phone", "Company", "Title", "Status", "Score", "Last Contact", "Notes", "Industry", "Website", "Facebook", "LinkedIn", "Employees", "Location"].includes(key))
                          .map(([key, value]) => (
                            <div key={key}>
                              <p className="text-sm text-muted-foreground">{key}</p>
                              {typeof value === 'string' && value.length > 150 ? (
                                renderExpandableText(value, key)
                              ) : (
                                <p>{value?.toString() || 'N/A'}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="m-0">
                    <div className="flex items-center justify-center h-48 p-6">
                      <div className="text-center space-y-2">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <h3 className="font-medium">No history available</h3>
                        <p className="text-sm text-muted-foreground">
                          Interaction history will be available in a future update.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="m-0 p-6">
                    <h3 className="font-semibold mb-3">Notes</h3>
                    {lead.row_data["Notes"] ? (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="whitespace-pre-wrap">{lead.row_data["Notes"] as string}</p>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">No notes available for this lead.</p>
                      </div>
                    )}
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
          
          <DrawerFooter className="border-t pt-6">
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
