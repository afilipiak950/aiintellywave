
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
  
  // Format date for display - matches the format in the provided images
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
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
