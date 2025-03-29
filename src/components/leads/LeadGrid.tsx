
import { useState, useCallback, memo, useMemo } from 'react';
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
  
  const handleLeadClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  }, []);
  
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);
  
  // Memoize the loading state UI
  const loadingUI = useMemo(() => {
    if (!loading) return null;
    
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
  }, [loading]);
  
  // Memoize the empty state UI
  const emptyUI = useMemo(() => {
    if (loading || (Array.isArray(leads) && leads.length > 0)) return null;
    
    return (
      <motion.div 
        className="text-center py-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-medium text-gray-900 mb-2">No leads found</h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria, or create a new lead using the "Add New Lead" button.
        </p>
      </motion.div>
    );
  }, [loading, leads]);
  
  // Return early for loading or empty states
  if (loading) return loadingUI;
  if (!Array.isArray(leads) || leads.length === 0) return emptyUI;
  
  // Define animation variants to stabilize animations
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  return (
    <>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {leads.map((lead) => (
          <motion.div
            key={lead.id}
            variants={itemVariants}
            layout="position"
            layoutId={lead.id}
          >
            <LeadCard
              lead={lead}
              onClick={handleLeadClick}
              index={0} // We don't need staggered animation based on index anymore
            />
          </motion.div>
        ))}
      </motion.div>
      
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
