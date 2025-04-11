
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCampaignTags = (campaignId?: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateCampaignTags = async (tags: string[]): Promise<boolean> => {
    if (!campaignId) return false;
    
    setIsUpdating(true);
    try {
      // Get the session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!sessionData?.session) {
        throw new Error('You need to be logged in to update campaign tags');
      }
      
      const accessToken = sessionData.session.access_token;
      
      // Call the edge function to update campaign tags
      const response = await supabase.functions.invoke('instantly-ai', {
        body: { 
          action: 'updateCampaignTags',
          campaignId,
          tags
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update campaign tags');
      }
      
      toast({
        title: 'Tags Updated',
        description: 'Campaign tags have been updated successfully.'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating campaign tags:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update tags',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    updateCampaignTags,
    isUpdating
  };
};
