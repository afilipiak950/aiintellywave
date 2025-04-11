
import { useState, useEffect } from 'react';
import { useCampaignTags } from '@/hooks/use-campaign-tags';

export const useCampaignDetail = (initialCampaign: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { 
    updateCampaignTags, 
    isUpdating, 
    availableTags,
    isLoadingTags
  } = useCampaignTags(initialCampaign?.id);

  // Load existing campaign tags when campaign changes
  useEffect(() => {
    if (initialCampaign && Array.isArray(initialCampaign.tags)) {
      setSelectedTags(initialCampaign.tags);
    } else {
      setSelectedTags([]);
    }
  }, [initialCampaign]);
  
  const handleSaveTags = async () => {
    await updateCampaignTags(selectedTags);
  };

  return {
    activeTab,
    setActiveTab,
    selectedTags,
    setSelectedTags,
    isUpdating,
    availableTags,
    isLoadingTags,
    handleSaveTags
  };
};
