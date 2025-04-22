
import { useState, useCallback, memo, useEffect } from 'react';
import { Lead } from '@/types/lead';
import { motion, AnimatePresence } from 'framer-motion';
import LeadCard from './LeadCard';
import LeadList from './LeadList';
import LeadDetailDialog from './LeadDetailDialog';
import { Loader2, RefreshCw } from 'lucide-react';
import LeadViewToggle from './LeadViewToggle';
import { Button } from '@/components/ui/button';

interface LeadGridProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  loading?: boolean;
  onRetryFetch?: () => void;
  isRetrying?: boolean;
  fetchError?: Error | null;
  retryCount?: number;
}

export const LeadGrid = memo(({
  leads,
  onUpdateLead,
  loading = false,
  onRetryFetch,
  isRetrying = false,
  fetchError = null,
  retryCount = 0
}: LeadGridProps) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Default to 'list' view
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  
  // Load saved preference from localStorage, but default to 'list'
  useEffect(() => {
    const savedViewMode = localStorage.getItem('leadViewMode');
    if (savedViewMode === 'card') {
      setViewMode('card');
    } else {
      // Ensure list is the default
      setViewMode('list');
      localStorage.setItem('leadViewMode', 'list');
    }
  }, []);
  
  // Save preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem('leadViewMode', viewMode);
  }, [viewMode]);
  
  const handleLeadClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  }, []);
  
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);
  
  // Listen for lead clicks from the table rows
  useEffect(() => {
    const handleTableRowClick = (event: Event) => {
      const customEvent = event as CustomEvent<Lead>;
      handleLeadClick(customEvent.detail);
    };
    
    document.addEventListener('leadClick', handleTableRowClick);
    
    return () => {
      document.removeEventListener('leadClick', handleTableRowClick);
    };
  }, [handleLeadClick]);
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading leads data...</p>
      </div>
    );
  }

  // Error state
  if (fetchError && !isRetrying) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Lead Fetch Error
        </h3>
        <p className="text-red-600 mb-4">
          Error fetching leads. This could be due to network issues or permissions.
          {retryCount > 0 && <span className="block mt-1">Retry attempts: {retryCount}</span>}
        </p>
        {onRetryFetch && (
          <Button 
            onClick={onRetryFetch}
            className="flex items-center gap-2"
            disabled={isRetrying}
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry Now'}
          </Button>
        )}
      </div>
    );
  }
  
  // Empty state
  if (!Array.isArray(leads) || leads.length === 0) {
    return (
      <motion.div 
        className="text-center py-16 px-4 bg-gradient-to-tr from-slate-50 to-gray-50 rounded-xl border border-slate-100 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No leads found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your search or filter criteria, or create a new lead using the "Add New Lead" button.
        </p>
      </motion.div>
    );
  }
  
  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <LeadViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
    
      {viewMode === 'list' ? (
        <LeadList 
          leads={leads} 
          onUpdateLead={onUpdateLead} 
          loading={loading}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="popLayout">
            {leads.map((lead, index) => (
              <motion.div
                key={lead.id}
                layout
                layoutId={lead.id}
                className="h-full"
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
      )}
      
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

export default LeadGrid;
