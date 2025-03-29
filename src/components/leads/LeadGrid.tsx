
import { useState, useCallback, memo } from 'react';
import { Lead } from '@/types/lead';
import { motion, AnimatePresence } from 'framer-motion';
import LeadCard from './LeadCard';
import LeadDetailDialog from './LeadDetailDialog';

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
  
  console.log('LeadGrid rendering with', leads?.length || 0, 'leads', { 
    loading,
    leadsDataType: typeof leads,
    isLeadsArray: Array.isArray(leads),
    firstLeadSample: leads && leads.length > 0 ? JSON.stringify(leads[0]) : 'no leads'
  });
  
  const handleLeadClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  }, []);
  
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);
  
  if (loading) {
    console.log('LeadGrid showing loading state');
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[220px] bg-gray-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }
  
  if (!leads || leads.length === 0) {
    console.log('LeadGrid showing empty state - no leads found');
    return (
      <motion.div 
        className="text-center py-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-medium text-gray-900 mb-2">No leads found</h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria, or create a new lead using the "Add New Lead" button.
        </p>
      </motion.div>
    );
  }
  
  console.log('LeadGrid rendering lead cards, count:', leads.length);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <AnimatePresence>
          {leads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                delay: Math.min(index * 0.05, 0.5),
                ease: "easeOut"
              }}
              layout
            >
              <LeadCard
                lead={lead}
                onClick={handleLeadClick}
                index={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <LeadDetailDialog
        lead={selectedLead}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onUpdate={onUpdateLead}
      />
    </>
  );
});

LeadGrid.displayName = 'LeadGrid';

export default LeadGrid;
