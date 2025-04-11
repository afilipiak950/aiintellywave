
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCampaignTags = (campaignId?: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  
  // Fetch available tags from customer data
  useEffect(() => {
    const fetchAvailableTags = async () => {
      setIsLoadingTags(true);
      try {
        // Get customer tags from companies table
        const { data, error } = await supabase
          .from('companies')
          .select('tags')
          .not('tags', 'is', null);
        
        if (error) {
          console.error('Error fetching company tags:', error);
          return;
        }
        
        // Extract unique tags from all companies
        const allTags = data?.flatMap(company => company.tags || []) || [];
        const uniqueTags = [...new Set(allTags)].filter(Boolean).sort();
        
        setAvailableTags(uniqueTags);
      } catch (error) {
        console.error('Failed to fetch available tags:', error);
      } finally {
        setIsLoadingTags(false);
      }
    };
    
    fetchAvailableTags();
  }, []);
  
  const updateCampaignTags = async (tags: string[]): Promise<boolean> => {
    if (!campaignId) {
      console.error('Cannot update tags: No campaign ID provided');
      toast({
        title: 'Error',
        description: 'Cannot update tags: Campaign ID is missing',
        variant: 'destructive'
      });
      return false;
    }
    
    setIsUpdating(true);
    try {
      console.log('Updating tags for campaign:', campaignId, tags);
      
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
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to update campaign tags');
      }
      
      if (response.data?.error) {
        console.error('Server error in response:', response.data.error);
        throw new Error(response.data.error.message || 'Server error updating campaign tags');
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
    isUpdating,
    availableTags,
    isLoadingTags
  };
};
