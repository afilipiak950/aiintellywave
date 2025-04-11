
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
      if (!campaignId) return;
      
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
  }, [campaignId]);
  
  const updateCampaignTags = async (tags: string[] = []): Promise<boolean> => {
    if (!campaignId) {
      console.error('Cannot update tags: No campaign ID provided');
      toast({
        title: 'Error',
        description: 'Cannot update tags: Campaign ID is missing',
        variant: 'destructive'
      });
      return false;
    }
    
    // Ensure tags is an array
    const safeTags = Array.isArray(tags) ? tags : [];
    
    setIsUpdating(true);
    try {
      console.log('Updating tags for campaign:', campaignId, safeTags);
      
      // Using the correct parameter names as defined in the SQL function
      const { data, error } = await supabase.rpc(
        'update_campaign_tags',
        {
          campaign_id_param: campaignId,
          tags_param: safeTags
        }
      );
      
      if (error) {
        console.error('Database function error:', error);
        throw new Error(error.message || 'Failed to update campaign tags');
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
