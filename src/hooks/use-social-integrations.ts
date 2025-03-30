
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';

export interface SocialIntegration {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  password?: string; // Only available to admins
  created_at: string;
  updated_at: string;
}

export const useSocialIntegrations = (platform: 'linkedin' | 'xing') => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch integrations for the current user and platform
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['socialIntegrations', platform, user?.id],
    queryFn: async (): Promise<SocialIntegration[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('social_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) {
        console.error('Error fetching social integrations:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user
  });

  const saveMutation = useMutation({
    mutationFn: async (integrationData: Partial<SocialIntegration>) => {
      if (!user) throw new Error('User not authenticated');

      const newIntegration = {
        ...integrationData,
        user_id: user.id,
        platform,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('social_integrations')
        .insert([newIntegration])
        .select()
        .single();

      if (error) {
        console.error('Error saving social integration:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialIntegrations', platform, user?.id] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialIntegration> & { id: string }) => {
      const { data, error } = await supabase
        .from('social_integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating social integration:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialIntegrations', platform, user?.id] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_integrations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting social integration:', error);
        throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialIntegrations', platform, user?.id] });
    }
  });

  return {
    integrations: data,
    isLoading,
    error,
    refetch,
    saveIntegration: saveMutation.mutate,
    updateIntegration: updateMutation.mutate,
    deleteIntegration: deleteMutation.mutate,
    isSaving: saveMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
