
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
      console.log(`Fetching ${platform} integrations for user ${user.id}`);
      
      const { data, error } = await supabase
        .from('social_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) {
        console.error(`Error fetching ${platform} integrations:`, error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} ${platform} integrations`, data);
      
      // Use email as default username if not set
      const typedData = data?.map(item => ({
        ...item,
        username: item.username || user.email || '',
        platform: item.platform as 'linkedin' | 'xing' | 'email_smtp'
      })) || [];
      
      setIntegrations(typedData);
    } catch (error) {
      console.error(`Error in fetchIntegrations for ${platform}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email, platform]);

  // Save integration
  const saveIntegration = async (integration: SaveIntegrationType): Promise<void> => {
    if (!user?.id) {
      console.error('Cannot save integration: No user ID');
      return;
    }
    
    try {
      setIsSaving(true);
      const newIntegration = {
        ...integration,
        user_id: user.id,
        username: integration.username || user.email!, // Use user's email as default if not provided
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log(`Saving ${platform} integration:`, { ...newIntegration, password: '***REDACTED***' });
      
      const { data, error } = await supabase
        .from('social_integrations')
        .insert([newIntegration])
        .select();

      if (error) {
        console.error(`Error saving ${platform} integration:`, error);
        throw error;
      }
      
      console.log(`Successfully saved ${platform} integration:`, data);
      
      await fetchIntegrations();
    } catch (error) {
      console.error(`Error in saveIntegration for ${platform}:`, error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Update integration
  const updateIntegration = async (integration: UpdateIntegration): Promise<void> => {
    if (!user?.id) {
      console.error('Cannot update integration: No user ID');
      return;
    }
    
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
      
      // Remove the id from the update data
      const { id, ...dataToUpdate } = updateData;
      
      console.log(`Updating ${platform} integration ${id}:`, { ...dataToUpdate, password: dataToUpdate.password ? '***REDACTED***' : undefined });
      
      const { data, error } = await supabase
        .from('social_integrations')
        .update(dataToUpdate)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error(`Error updating ${platform} integration:`, error);
        throw error;
      }
      
      console.log(`Successfully updated ${platform} integration:`, data);
      
      await fetchIntegrations();
    } catch (error) {
      console.error(`Error in updateIntegration for ${platform}:`, error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete integration with proper Promise handling
  const deleteIntegration = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      console.log(`Deleting ${platform} integration ${id}`);
      
      const { data, error } = await supabase
        .from('social_integrations')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)
        .select();
        
      if (error) {
        console.error(`Error deleting ${platform} integration:`, error);
        throw error;
      }
      
      console.log(`Successfully deleted ${platform} integration:`, data);
      
      setIntegrations(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error(`Error in deleteIntegration for ${platform}:`, error);
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
