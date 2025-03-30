
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

interface SocialIntegration {
  id?: string;
  username: string;
  password: string;
  platform: 'linkedin' | 'xing';
  updated_at?: string;
  created_at?: string;
}

interface UpdateIntegration {
  id: string;
  username?: string;
  password?: string;
}

export function useSocialIntegrations(platform: 'linkedin' | 'xing') {
  const [integrations, setIntegrations] = useState<SocialIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  // Fetch integrations
  const fetchIntegrations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('social_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching social integrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, platform]);

  // Save integration
  const saveIntegration = async (integration: Omit<SocialIntegration, 'user_id'>) => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      const newIntegration = {
        ...integration,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('social_integrations')
        .upsert([newIntegration]);

      if (error) throw error;
      
      fetchIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Update integration
  const updateIntegration = async (integration: UpdateIntegration) => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('social_integrations')
        .update({
          ...integration,
          updated_at: new Date().toISOString(),
        })
        .eq('id', integration.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      fetchIntegrations();
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete integration
  const deleteIntegration = async (id: string) => {
    if (!user?.id) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('social_integrations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setIntegrations(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Load integrations on mount
  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return {
    integrations,
    isLoading,
    isSaving,
    isDeleting,
    saveIntegration,
    updateIntegration,
    deleteIntegration,
    refresh: fetchIntegrations
  };
}
