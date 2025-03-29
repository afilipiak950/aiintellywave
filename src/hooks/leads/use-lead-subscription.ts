
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

interface UseLeadSubscriptionOptions {
  onInsert?: (lead: Lead) => void;
  onUpdate?: (lead: Lead) => void;
  onDelete?: (id: string) => void;
  projectId?: string;
  assignedToUser?: boolean;
}

export const useLeadSubscription = ({
  onInsert,
  onUpdate,
  onDelete,
  projectId,
  assignedToUser
}: UseLeadSubscriptionOptions = {}) => {
  const channelRef = useRef<any>(null);

  const setupSubscription = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    console.log('Setting up lead subscription...');
    
    const channel = supabase.channel('leads-changes');
    
    // Handle inserts
    if (onInsert) {
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        async (payload) => {
          console.log('Lead inserted:', payload);
          
          // If filtering by project is needed, check project_id
          const newLead = payload.new as Lead;
          
          if (projectId && newLead.project_id !== projectId) {
            return;
          }
          
          // If we need to filter by assigned to user, we'll need to fetch the project
          if (assignedToUser && newLead.project_id) {
            const { data: project } = await supabase
              .from('projects')
              .select('assigned_to')
              .eq('id', newLead.project_id)
              .single();
              
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!project || project.assigned_to !== user?.id) {
              return;
            }
          }
          
          // Get additional joined data if needed
          if (newLead.project_id) {
            const { data: project } = await supabase
              .from('projects')
              .select('name')
              .eq('id', newLead.project_id)
              .single();
              
            if (project) {
              newLead.project_name = project.name;
            }
          }
          
          onInsert(newLead);
        }
      );
    }
    
    // Handle updates
    if (onUpdate) {
      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leads' },
        async (payload) => {
          console.log('Lead updated:', payload);
          
          // If filtering by project is needed, check project_id
          const updatedLead = payload.new as Lead;
          
          if (projectId && updatedLead.project_id !== projectId) {
            return;
          }
          
          // If we need to filter by assigned to user, we'll need to fetch the project
          if (assignedToUser && updatedLead.project_id) {
            const { data: project } = await supabase
              .from('projects')
              .select('assigned_to')
              .eq('id', updatedLead.project_id)
              .single();
              
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!project || project.assigned_to !== user?.id) {
              return;
            }
          }
          
          // Get additional joined data if needed
          if (updatedLead.project_id) {
            const { data: project } = await supabase
              .from('projects')
              .select('name')
              .eq('id', updatedLead.project_id)
              .single();
              
            if (project) {
              updatedLead.project_name = project.name;
            }
          }
          
          onUpdate(updatedLead);
        }
      );
    }
    
    // Handle deletes
    if (onDelete) {
      channel.on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'leads' },
        (payload) => {
          console.log('Lead deleted:', payload);
          const deletedLeadId = (payload.old as Lead).id;
          onDelete(deletedLeadId);
        }
      );
    }
    
    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to lead changes');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Failed to subscribe to lead changes');
        toast({
          title: 'Subscription Error',
          description: 'Unable to subscribe to real-time lead updates.',
          variant: 'destructive',
        });
      }
    });
    
    channelRef.current = channel;
    
    return () => {
      console.log('Cleaning up lead subscription...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [onInsert, onUpdate, onDelete, projectId, assignedToUser]);

  useEffect(() => {
    return setupSubscription();
  }, [setupSubscription]);

  return {
    reconnect: setupSubscription
  };
};
