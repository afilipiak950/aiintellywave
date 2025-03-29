
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Lead } from '@/types/lead';
import { motion, AnimatePresence } from "framer-motion";
import { Building, Calendar, ChevronDown, ChevronUp, ExternalLink, Facebook, Globe, Linkedin, Mail, MapPin, Phone, Users, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
}

/**
 * Modern lead detail dialog with animation effects and expandable fields
 */
const LeadDetailDialog = ({ lead, open, onClose, onUpdate }: LeadDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  
  // Reset state when lead changes or dialog closes
  useEffect(() => {
    setActiveTab("overview");
    setExpandedFields({});
  }, [lead, open]);
  
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
    website: lead.extra_data?.Website || lead.extra_data?.website,
    linkedin: lead.extra_data?.LinkedIn || lead.extra_data?.linkedin,
    facebook: lead.extra_data?.Facebook || lead.extra_data?.facebook,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold text-white">Lead/Candidate Details</DialogTitle>
            <DialogClose className="text-white hover:text-white/80">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
        </DialogHeader>
        
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
          
          <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="overview" className="p-0 m-0">
                  {/* Lead Profile Section */}
                  <div className="flex gap-4 p-6 border-b">
                    <Avatar className="h-16 w-16 rounded-full border-2 border-primary/20 ring-2 ring-white">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{lead.name}</h2>
                      {lead.position && (
                        <p className="text-muted-foreground">{lead.position}</p>
                      )}
                      {lead.company && (
                        <div className="flex items-center mt-1">
                          <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm font-medium">{lead.company}</span>
                        </div>
                      )}
                      
                      {/* Industry Badge */}
                      {lead.extra_data?.Industry && (
                        <Badge variant="outline" className="mt-2">
                          {lead.extra_data.Industry}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="p-6 border-b">
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      {lead.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-3 text-indigo-500" />
                          <a href={`mailto:${lead.email}`} className="hover:underline text-indigo-600">
                            {lead.email}
                          </a>
                        </div>
                      )}
                      
                      {lead.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-3 text-indigo-500" />
                          <a href={`tel:${lead.phone}`} className="hover:underline text-indigo-600">
                            {lead.phone}
                          </a>
                        </div>
                      )}
                      
                      {lead.extra_data?.Location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-3 text-indigo-500" />
                          <span>{lead.extra_data.Location}</span>
                        </div>
                      )}
                      
                      {lead.extra_data?.Employees && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-3 text-indigo-500" />
                          <span>Employees: {lead.extra_data.Employees}</span>
                        </div>
                      )}
                      
                      {lead.extra_data?.Website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-3 text-indigo-500" />
                          <a 
                            href={lead.extra_data.Website.startsWith('http') ? lead.extra_data.Website : `https://${lead.extra_data.Website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline text-indigo-600 flex items-center"
                          >
                            {lead.extra_data.Website}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  {(socialLinks.website || socialLinks.linkedin || socialLinks.facebook) && (
                    <div className="p-6 border-b">
                      <div className="flex gap-2">
                        {socialLinks.linkedin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            asChild
                          >
                            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                        {socialLinks.facebook && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            asChild
                          >
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                              <Facebook className="h-4 w-4" />
                              Facebook
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Lead Details */}
                  <div className="p-6 border-b">
                    <h3 className="font-semibold mb-3">Additional Information</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge 
                          variant={lead.status === 'new' ? 'default' : 'outline'} 
                          className="mt-1 capitalize"
                        >
                          {lead.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p>{lead.score || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Last Contact</p>
                        <p>{lead.last_contact || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        {renderExpandableText(lead.notes || '', 'notes')}
                      </div>
                    </div>
                  </div>

                  {/* Extra Data Fields */}
                  {lead.extra_data && Object.keys(lead.extra_data).length > 0 && (
                    <div className="p-6 border-b">
                      <h3 className="font-semibold mb-3">Other Information</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {Object.entries(lead.extra_data)
                          .filter(([key]) => !['Industry', 'Website', 'Facebook', 'LinkedIn', 'Employees', 'Location'].includes(key))
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
                  )}
                </TabsContent>

                <TabsContent value="history" className="p-0 m-0">
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
                
                <TabsContent value="notes" className="p-0 m-0">
                  <div className="p-6">
                    <h3 className="font-semibold mb-3">Notes</h3>
                    {lead.notes ? (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="whitespace-pre-wrap">{lead.notes}</p>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">No notes available for this lead.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
        
        <div className="p-6 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button 
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
            onClick={handleConvert}
          >
            Convert to Candidate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;
