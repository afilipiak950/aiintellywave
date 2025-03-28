
import { useState } from 'react';
import { Lead } from '@/types/lead';
import { motion } from 'framer-motion';
import LeadCard from './LeadCard';
import LeadDetailDialog from './LeadDetailDialog';

interface LeadGridProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  loading?: boolean;
}

export const LeadGrid = ({
  leads,
  onUpdateLead,
  loading = false
}: LeadGridProps) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  console.log('LeadGrid rendering with', leads?.length || 0, 'leads', { loading });
  
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };
  
  if (loading) {
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
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {leads.map((lead, index) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onClick={handleLeadClick}
            index={index}
          />
        ))}
      </div>
      
      <LeadDetailDialog
        lead={selectedLead}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onUpdate={onUpdateLead}
      />
    </>
  );
};

export default LeadGrid;
