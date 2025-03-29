
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Lead } from '@/types/lead';
import { AnimatePresence } from "framer-motion";
import { toast } from '@/hooks/use-toast';

// Import refactored components
import LeadDetailHeader from './detail/LeadDetailHeader';
import LeadProfileCard from './detail/LeadProfileCard';
import LeadDetailTabs from './detail/LeadDetailTabs';
import OverviewTabContent from './detail/tabs/OverviewTabContent';
import DetailsTabContent from './detail/tabs/DetailsTabContent';
import NotesTabContent from './detail/tabs/NotesTabContent';
import LeadDetailFooter from './detail/LeadDetailFooter';
import { getInitialsFromName, getLinkedInUrlFromLead, formatLinkedInUrl } from './detail/LeadDetailUtils';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
}

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

  // Toggle expanded state for text fields
  const toggleExpand = (key: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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

  // Get initials for avatar
  const getInitials = () => getInitialsFromName(lead.name);
  
  // Get LinkedIn URL
  const getLinkedInUrl = () => {
    const url = getLinkedInUrlFromLead(lead);
    return url;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header with gradient background */}
        <LeadDetailHeader 
          lead={lead} 
          getLinkedInUrl={getLinkedInUrl} 
        />
        
        {/* Lead profile card with avatar and main info */}
        <LeadProfileCard 
          lead={lead} 
          getInitials={getInitials} 
        />
        
        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <LeadDetailTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          
          {/* Tab content area */}
          <div key={activeTab} className="py-4 px-6">
            <AnimatePresence mode="wait">
              <TabsContent value="overview" className="m-0 p-0 space-y-6">
                <OverviewTabContent 
                  lead={lead} 
                  getLinkedInUrl={getLinkedInUrl} 
                />
              </TabsContent>

              <TabsContent value="details" className="m-0 p-0">
                <DetailsTabContent 
                  lead={lead}
                  expandedFields={expandedFields}
                  toggleExpand={toggleExpand}
                />
              </TabsContent>
              
              <TabsContent value="notes" className="m-0 p-0">
                <NotesTabContent lead={lead} />
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
        
        {/* Footer with actions */}
        <LeadDetailFooter 
          onClose={onClose} 
          onConvert={handleConvert} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;
