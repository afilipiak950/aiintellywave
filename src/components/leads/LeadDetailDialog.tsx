
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from '@/types/lead';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, Calendar, ChevronDown, ChevronUp, ExternalLink, 
  Facebook, Globe, Linkedin, Mail, MapPin, Phone, Users, 
  X, FileText, Hash, AlertCircle, Clock, CreditCard
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
}

/**
 * Modern lead detail dialog with animation effects, scrollable content and expandable fields
 */
const LeadDetailDialog = ({ lead, open, onClose, onUpdate }: LeadDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Reset state when lead changes or dialog closes
  useEffect(() => {
    setActiveTab("overview");
    setExpandedFields({});
    setAnimationComplete(false);
    
    // Small delay to make sure animation is noticed
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 400);
    
    return () => clearTimeout(timer);
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

  // Get LinkedIn URL from lead data
  const getLinkedInUrl = () => {
    if (lead.extra_data?.linkedin_url) return lead.extra_data.linkedin_url;
    if (lead.extra_data?.["LinkedIn Url"]) return lead.extra_data["LinkedIn Url"];
    if (lead.extra_data?.["LinkedIn"]) return lead.extra_data["LinkedIn"];
    return null;
  };

  // Render expanded/collapsible text
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
          className="flex items-center text-xs p-0 h-auto hover:text-blue-500 transition-colors"
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

  const linkedInUrl = getLinkedInUrl();
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header with gradient background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <DialogHeader className="p-6 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 text-white">
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl font-bold text-white">Lead Details</DialogTitle>
              <div className="flex items-center gap-2">
                {linkedInUrl && (
                  <motion.a
                    href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0077B5] hover:bg-[#0077B5]/90 text-white p-2 rounded-full transition-transform hover:scale-110"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Linkedin className="h-4 w-4" />
                  </motion.a>
                )}
                <DialogClose className="text-white hover:text-white/80 rounded-full p-1.5 bg-white/20 hover:bg-white/30 transition-colors">
                  <X className="h-4 w-4" />
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
        </motion.div>
        
        {/* Lead profile card with avatar and main info */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-6 border-b"
        >
          <div className="flex gap-4 items-start">
            <Avatar className="h-20 w-20 rounded-xl border-4 border-white shadow-xl bg-gradient-to-br from-indigo-100 to-purple-100">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <h2 className="text-2xl font-bold">{lead.name}</h2>
                  {lead.position && (
                    <p className="text-muted-foreground">{lead.position}</p>
                  )}
                </div>
                  
                <Badge 
                  variant={lead.status === 'new' ? 'default' : 'outline'} 
                  className={cn(
                    "text-xs px-2 py-0.5 capitalize",
                    lead.status === 'qualified' && "bg-green-100 text-green-800 border-green-300",
                    lead.status === 'contacted' && "bg-blue-100 text-blue-800 border-blue-300",
                    lead.status === 'negotiation' && "bg-amber-100 text-amber-800 border-amber-300",
                    lead.status === 'won' && "bg-emerald-100 text-emerald-800 border-emerald-300",
                    lead.status === 'lost' && "bg-red-100 text-red-800 border-red-300",
                  )}
                >
                  {lead.status}
                </Badge>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                {lead.company && (
                  <div className="flex items-center text-sm">
                    <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span>{lead.company}</span>
                  </div>
                )}
                
                {lead.score > 0 && (
                  <Badge variant="outline" className="bg-amber-50 border-amber-200">
                    Score: {lead.score}
                  </Badge>
                )}
                
                {lead.last_contact && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Last contact: {lead.last_contact}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Tabs for different sections */}
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
                value="details" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-full"
              >
                All Details
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-full"
              >
                Notes
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Scrollable content area */}
          <ScrollArea className="max-h-[calc(90vh-16rem)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="py-4 px-6"
              >
                <TabsContent value="overview" className="m-0 p-0 space-y-6">
                  {/* Contact Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-base font-semibold mb-3 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      {lead.email && (
                        <div className="flex items-center group">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                            <Mail className="h-4 w-4 text-blue-500" />
                          </div>
                          <a 
                            href={`mailto:${lead.email}`} 
                            className="text-blue-600 hover:text-blue-700 hover:underline group-hover:translate-x-0.5 transition-transform"
                          >
                            {lead.email}
                          </a>
                        </div>
                      )}
                      
                      {lead.phone && (
                        <div className="flex items-center group">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                            <Phone className="h-4 w-4 text-green-500" />
                          </div>
                          <a 
                            href={`tel:${lead.phone}`} 
                            className="text-blue-600 hover:text-blue-700 hover:underline group-hover:translate-x-0.5 transition-transform"
                          >
                            {lead.phone}
                          </a>
                        </div>
                      )}
                      
                      {lead.extra_data?.["Website"] && (
                        <div className="flex items-center group">
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                            <Globe className="h-4 w-4 text-purple-500" />
                          </div>
                          <a 
                            href={lead.extra_data["Website"].startsWith('http') ? lead.extra_data["Website"] : `https://${lead.extra_data["Website"]}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline flex items-center group-hover:translate-x-0.5 transition-transform"
                          >
                            {lead.extra_data["Website"]}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      
                      {(lead.extra_data?.["Location"] || lead.extra_data?.["City"] || lead.extra_data?.["Country"]) && (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                            <MapPin className="h-4 w-4 text-amber-500" />
                          </div>
                          <span>
                            {[
                              lead.extra_data?.["Location"], 
                              lead.extra_data?.["City"], 
                              lead.extra_data?.["Country"]
                            ].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Company Information Card (if data available) */}
                  {(lead.company || lead.extra_data?.["Industry"] || lead.extra_data?.["Company Size"]) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-base font-semibold mb-3 flex items-center">
                        <Building className="h-4 w-4 mr-2 text-indigo-500" />
                        Company Information
                      </h3>
                      <div className="space-y-3">
                        {lead.company && (
                          <div className="flex items-start">
                            <span className="text-sm text-muted-foreground w-32">Company:</span>
                            <span className="font-medium">{lead.company}</span>
                          </div>
                        )}
                        
                        {lead.extra_data?.["Industry"] && (
                          <div className="flex items-start">
                            <span className="text-sm text-muted-foreground w-32">Industry:</span>
                            <span>{lead.extra_data["Industry"]}</span>
                          </div>
                        )}
                        
                        {lead.extra_data?.["Company Size"] && (
                          <div className="flex items-start">
                            <span className="text-sm text-muted-foreground w-32">Company Size:</span>
                            <span>{lead.extra_data["Company Size"]}</span>
                          </div>
                        )}
                        
                        {lead.extra_data?.["Revenue"] && (
                          <div className="flex items-start">
                            <span className="text-sm text-muted-foreground w-32">Revenue:</span>
                            <span>{lead.extra_data["Revenue"]}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Social Media Links */}
                  {(linkedInUrl || lead.extra_data?.["Facebook"] || lead.extra_data?.["Twitter"]) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Social Profiles</h3>
                      <div className="flex gap-2 flex-wrap">
                        {linkedInUrl && (
                          <motion.a
                            href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-md hover:bg-[#0077B5]/90 transition-colors"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Linkedin className="h-4 w-4" />
                            View on LinkedIn
                          </motion.a>
                        )}
                        
                        {lead.extra_data?.["Facebook"] && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2"
                            asChild
                          >
                            <a 
                              href={lead.extra_data["Facebook"].startsWith('http') ? lead.extra_data["Facebook"] : `https://${lead.extra_data["Facebook"]}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Facebook className="h-4 w-4 text-[#1877F2]" />
                              Facebook
                            </a>
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Tags Section */}
                  {lead.tags && lead.tags.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-slate-100">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="details" className="m-0 p-0">
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-base font-semibold mb-3">All Lead Information</h3>
                      
                      <div className="grid grid-cols-1 gap-4 bg-white border rounded-lg p-4 shadow-sm">
                        {/* Standard fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{lead.name || 'N/A'}</p>
                          </div>
                          {lead.email && (
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium">{lead.email}</p>
                            </div>
                          )}
                          {lead.phone && (
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium">{lead.phone}</p>
                            </div>
                          )}
                          {lead.company && (
                            <div>
                              <p className="text-sm text-muted-foreground">Company</p>
                              <p className="font-medium">{lead.company}</p>
                            </div>
                          )}
                          {lead.position && (
                            <div>
                              <p className="text-sm text-muted-foreground">Position</p>
                              <p className="font-medium">{lead.position}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="font-medium capitalize">{lead.status}</p>
                          </div>
                          {lead.score > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground">Score</p>
                              <p className="font-medium">{lead.score}</p>
                            </div>
                          )}
                          {lead.last_contact && (
                            <div>
                              <p className="text-sm text-muted-foreground">Last Contact</p>
                              <p className="font-medium">{lead.last_contact}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Extra data fields - display absolutely everything */}
                        {lead.extra_data && Object.keys(lead.extra_data).length > 0 && (
                          <>
                            <div className="border-t border-dashed pt-4 mt-2">
                              <h4 className="text-sm font-medium mb-3 flex items-center">
                                <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                                Additional Information
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {Object.entries(lead.extra_data).map(([key, value]) => (
                                  <div key={key} className="group">
                                    <p className="text-sm text-muted-foreground">{key}</p>
                                    {typeof value === 'string' && value.length > 150 ? (
                                      renderExpandableText(value, key)
                                    ) : (
                                      <p className="font-medium break-words group-hover:bg-slate-50 p-1 transition-colors rounded">
                                        {value?.toString() || 'N/A'}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="m-0 p-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Notes</h3>
                    </div>
                    
                    {lead.notes ? (
                      <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                        <p className="whitespace-pre-wrap">{lead.notes}</p>
                      </div>
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
        
        {/* Footer with actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="p-4 border-t flex justify-end space-x-2"
        >
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button 
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
            onClick={handleConvert}
          >
            Convert to Candidate
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;
