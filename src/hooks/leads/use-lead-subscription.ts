
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

interface LeadSubscriptionOptions {
  onInsert?: (newLead: Lead) => void;
  onUpdate?: (updatedLead: Lead) => void; 
  onDelete?: (deletedLeadId: string) => void;
  projectId?: string;
  assignedToUser?: boolean;
}

/**
 * Hook for setting up real-time subscriptions to lead changes
 */
export const useLeadSubscription = (options: LeadSubscriptionOptions) => {
  useEffect(() => {
    // Set up the channel subscription
    const channel = supabase.channel('public:leads')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'leads' 
      }, payload => {
        console.log('Lead inserted:', payload);
        if (options.onInsert && payload.new) {
          // Cast as Lead since we know the structure
          options.onInsert(payload.new as Lead);
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'leads' 
      }, payload => {
        console.log('Lead updated:', payload);
        if (options.onUpdate && payload.new) {
          // Cast as Lead since we know the structure
          options.onUpdate(payload.new as Lead);
        }
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'leads' 
      }, payload => {
        console.log('Lead deleted:', payload);
        if (options.onDelete && payload.old?.id) {
          // We only need the ID for deletions
          options.onDelete(payload.old.id as string);
        }
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to lead changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to lead changes');
          toast({
            title: 'Realtime Subscription Error',
            description: 'Could not establish realtime connection for leads. Some updates may be delayed.',
            variant: 'destructive'
          });
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Unsubscribing from lead changes');
      supabase.removeChannel(channel);
    };
  }, [options.onInsert, options.onUpdate, options.onDelete, options.projectId, options.assignedToUser]);
};
