
import { useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Lead } from '@/types/lead';
import { AnimatePresence } from "framer-motion";

// Import refactored components
import LeadDetailHeader from './LeadDetailHeader';
import LeadProfileCard from './LeadProfileCard';
import LeadDetailTabs from './LeadDetailTabs';
import OverviewTabContent from './tabs/overview/OverviewTabContent';
import DetailsTabContent from './tabs/DetailsTabContent';
import NotesTabContent from './tabs/NotesTabContent';
import LeadDetailFooter from './LeadDetailFooter';
import { getInitialsFromName, getLinkedInUrlFromLead } from './LeadDetailUtils';
import { LeadDialogProvider, useLeadDialog } from './LeadDialogContext';
import { useLeadConversion } from './hooks/useLeadConversion';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
}

// Internal component that uses the context
const LeadDetailDialogContent = ({ lead, onClose, onUpdate }: Omit<LeadDetailDialogProps, 'open'>) => {
  const { activeTab, setActiveTab, expandedFields, toggleExpand } = useLeadDialog();
  const { handleConvert, isConverting } = useLeadConversion({ onUpdate, onClose });
  
  // Reset state when lead changes
  useEffect(() => {
    setActiveTab("overview");
  }, [lead, setActiveTab]);
  
  // If no lead, don't render anything
  if (!lead) return null;

  // Get initials for avatar
  const getInitials = () => getInitialsFromName(lead.name);
  
  // Get LinkedIn URL
  const linkedInUrl = getLinkedInUrlFromLead(lead);

  return (
    <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 animate-in fade-in-0 zoom-in-95 duration-300">
      {/* Header with gradient background */}
      <LeadDetailHeader 
        lead={lead} 
        getLinkedInUrl={() => linkedInUrl} 
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
              <OverviewTabContent lead={lead} />
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
        onConvert={() => handleConvert(lead)} 
        isConverting={isConverting}
      />
    </DialogContent>
  );
};

// Main component that provides the context
const LeadDetailDialog = ({ lead, open, onClose, onUpdate }: LeadDetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <LeadDialogProvider>
        {lead && <LeadDetailDialogContent lead={lead} onClose={onClose} onUpdate={onUpdate} />}
      </LeadDialogProvider>
    </Dialog>
  );
};

export default LeadDetailDialog;
