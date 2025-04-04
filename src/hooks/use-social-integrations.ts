
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { SocialIntegration } from '@/types/persona';

interface UpdateIntegration {
  id: string;
  username?: string;
  password?: string;
  smtp_host?: string;
  smtp_port?: string;
  imap_host?: string;
  imap_port?: string;
}

type SaveIntegrationType = Omit<SocialIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export function useSocialIntegrations(platform: 'linkedin' | 'xing' | 'email_smtp') {
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
      
      // Use email as default username if not set
      const typedData = data?.map(item => ({
        ...item,
        username: item.username || user.email || '',
        platform: item.platform as 'linkedin' | 'xing' | 'email_smtp'
      })) || [];
      
      setIntegrations(typedData);
    } catch (error) {
      console.error('Error fetching social integrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email, platform]);

  // Save integration
  const saveIntegration = async (integration: SaveIntegrationType): Promise<void> => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      const newIntegration = {
        ...integration,
        user_id: user.id,
        username: integration.username || user.email!, // Use user's email as default if not provided
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('social_integrations')
        .upsert([newIntegration]);

      if (error) throw error;
      
      await fetchIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Update integration
  const updateIntegration = async (integration: UpdateIntegration): Promise<void> => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      const updateData: Record<string, any> = {
        ...integration,
        updated_at: new Date().toISOString(),
      };
      
      // Only include username in update if it's explicitly provided
      if (integration.username !== undefined) {
        updateData.username = integration.username;
      }
      
      const { error } = await supabase
        .from('social_integrations')
        .update(updateData)
        .eq('id', integration.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchIntegrations();
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete integration with proper Promise handling
  const deleteIntegration = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('social_integrations')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error deleting integration:', error);
        throw error;
      }
      
      setIntegrations(prev => prev.filter(item => item.id !== id));
    } catch (error) {
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
