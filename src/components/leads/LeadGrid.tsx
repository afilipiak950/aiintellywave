
import { useState, useCallback, memo } from 'react';
import { Lead } from '@/types/lead';
import { motion, AnimatePresence } from 'framer-motion';
import LeadCard from './LeadCard';
import LeadDetailDialog from './LeadDetailDialog';
import { Loader2 } from 'lucide-react';

interface LeadGridProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  loading?: boolean;
}

// Using memo to prevent unnecessary re-renders of the whole grid
export const LeadGrid = memo(({
  leads,
  onUpdateLead,
  loading = false
}: LeadGridProps) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleLeadClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  }, []);
  
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }
  
  if (!Array.isArray(leads) || leads.length === 0) {
    return (
      <motion.div 
        className="text-center py-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
          No leads found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Try adjusting your search or filter criteria, or create a new lead using the "Add New Lead" button.
        </p>
      </motion.div>
    );
  }
  
  return (
    <>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          {leads.map((lead, index) => (
            <motion.div
              key={lead.id}
              layout
              layoutId={lead.id}
            >
              <LeadCard
                lead={lead}
                onClick={handleLeadClick}
                index={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      {selectedLead && (
        <LeadDetailDialog
          lead={selectedLead}
          open={dialogOpen}
          onClose={handleCloseDialog}
          onUpdate={onUpdateLead}
        />
      )}
    </>
  );
});

LeadGrid.displayName = 'LeadGrid';

export default LeadGrid;
