
import { useState } from 'react';
import { useCampaignTags } from '@/hooks/use-campaign-tags';

export function useCampaignDetail(campaign: any) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTags, setSelectedTags] = useState<string[]>(campaign?.tags || []);
  const { updateCampaignTags, isUpdating, availableTags, isLoadingTags } = useCampaignTags(campaign?.id);
  
  const handleSaveTags = async () => {
    const success = await updateCampaignTags(selectedTags);
    if (success) {
      // Successfully saved
      // The toast is handled in the useCampaignTags hook
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('de-DE');
  };
  
  return {
    activeTab,
    setActiveTab,
    selectedTags,
    setSelectedTags,
    handleSaveTags,
    isUpdating,
    availableTags,
    isLoadingTags,
    formatDate
  };
}
