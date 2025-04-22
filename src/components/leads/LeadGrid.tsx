
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import LeadCard from './LeadCard';
import LeadListLoading from './list/LeadListLoading';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import LeadDetailDialog from './LeadDetailDialog';
import { getLeadErrorMessage } from './lead-error-utils';

interface LeadGridProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  loading?: boolean;
  onRetryFetch?: () => void;
  isRetrying?: boolean;
  fetchError?: Error | null;
  retryCount?: number;
}

// Main grid component
const LeadGrid: React.FC<LeadGridProps> = ({
  leads,
  onUpdateLead,
  loading = false,
  onRetryFetch,
  isRetrying = false,
  fetchError,
  retryCount = 0
}) => {
  // State for dialog (open/close) and selected lead
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // If we're loading, show the loading state
  if (loading) {
    return <LeadListLoading />;
  }

  // If there's an error but no leads to display, show the error alert (compact)
  if (fetchError && leads.length === 0) {
    return (
      <div className="mt-4 text-center p-8 border border-gray-200 rounded-lg bg-gray-50">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="font-medium text-lg mb-1">Lead Fetch Error</h3>
          <p className="text-sm text-gray-600 mb-4">
            {getLeadErrorMessage(fetchError)}
          </p>
          {onRetryFetch && (
            <Button 
              onClick={onRetryFetch}
              disabled={isRetrying}
              variant="outline"
              className="mx-auto"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // If there are no leads, show an empty state
  if (leads.length === 0) {
    return (
      <div className="mt-4 text-center p-8 border border-gray-200 rounded-lg bg-gray-50">
        <div className="max-w-md mx-auto">
          <h3 className="font-medium text-lg mb-1">No Leads Found</h3>
          <p className="text-sm text-gray-600 mb-4">
            There are no leads matching your current filters.
          </p>
          {onRetryFetch && (
            <Button 
              onClick={onRetryFetch}
              variant="outline"
              className="mx-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, show the leads grid
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {leads.map((lead, idx) => (
          <LeadCard 
            key={lead.id} 
            lead={lead}
            index={idx}
            onClick={() => setSelectedLead(lead)}
          />
        ))}
      </div>
      {selectedLead && (
        <LeadDetailDialog 
          open={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          lead={selectedLead}
          onUpdate={onUpdateLead}
        />
      )}
    </>
  );
};

export default LeadGrid;
