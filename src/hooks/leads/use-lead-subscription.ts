
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { useQueryClient } from '@tanstack/react-query';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Skip if no user is authenticated
    if (!user) {
      return;
    }

    // Build filter based on options
    const filters = [];
    
    if (options.projectId) {
      filters.push(`project_id=eq.${options.projectId}`);
    }

    if (options.assignedToUser && user?.id) {
      filters.push(`assigned_to=eq.${user.id}`);
    }

    // Generate a channel name that includes the filter conditions
    const channelName = `public:leads:${filters.length > 0 ? filters.join(':') : 'all'}`;
    console.log(`Setting up lead subscription with channel: ${channelName}`);

    // Set up the channel subscription
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'leads',
        ...(filters.length > 0 && { filter: filters.join(',') })
      }, payload => {
        console.log('Lead inserted:', payload);
        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        
        if (options.onInsert && payload.new) {
          // Cast as Lead since we know the structure
          options.onInsert(payload.new as Lead);
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'leads',
        ...(filters.length > 0 && { filter: filters.join(',') })
      }, payload => {
        console.log('Lead updated:', payload);
        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        
        if (options.onUpdate && payload.new) {
          // Cast as Lead since we know the structure
          options.onUpdate(payload.new as Lead);
        }
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'leads',
        ...(filters.length > 0 && { filter: filters.join(',') })
      }, payload => {
        console.log('Lead deleted:', payload);
        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        
        if (options.onDelete && payload.old?.id) {
          // We only need the ID for deletions
          options.onDelete(payload.old.id as string);
        }
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to lead changes with filters:', filters);
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
  }, [options.onInsert, options.onUpdate, options.onDelete, options.projectId, options.assignedToUser, user, queryClient]);
};
