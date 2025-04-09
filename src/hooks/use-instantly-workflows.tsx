
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  fetchInstantlyCampaigns, 
  fetchCampaignDetails, 
  assignCampaignToCustomer,
  refreshCampaignMetrics,
  InstantlyCampaign,
  InstantlyCampaignDetailedMetrics 
} from '@/services/instantlyService';
import { supabase } from '@/integrations/supabase/client';

export function useInstantlyWorkflows() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<InstantlyCampaign | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // Fetch all campaigns
  const { 
    data: campaigns, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['instantly-campaigns'],
    queryFn: fetchInstantlyCampaigns,
  });

  // Fetch companies for assignment
  const { 
    data: companies,
    isLoading: isLoadingCompanies
  } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');
      
      if (error) throw new Error(error.message);
      return data;
    }
  });

  // Fetch campaign details
  const { 
    data: campaignDetails,
    isLoading: isLoadingDetails,
    error: detailsError
  } = useQuery({
    queryKey: ['campaign-details', selectedCampaign?.id],
    queryFn: () => selectedCampaign ? fetchCampaignDetails(selectedCampaign.id) : Promise.resolve(null),
    enabled: !!selectedCampaign,
  });

  // Assign campaign mutation
  const assignMutation = useMutation({
    mutationFn: ({ campaignId, customerId }: { campaignId: string, customerId: string }) => 
      assignCampaignToCustomer(campaignId, customerId),
    onSuccess: () => {
      toast({
        title: 'Campaign assigned successfully',
        description: 'The customer can now access this campaign'
      });
      setAssignModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['customer-campaigns'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to assign campaign',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Refresh metrics mutation
  const refreshMetricsMutation = useMutation({
    mutationFn: refreshCampaignMetrics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instantly-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['customer-campaigns'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to refresh metrics',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns?.filter(campaign => {
    if (!searchTerm) return true;
    return (
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAssignCampaign = (campaign: InstantlyCampaign) => {
    setSelectedCampaign(campaign);
    setAssignModalOpen(true);
  };

  const handleViewDetails = (campaign: InstantlyCampaign) => {
    setSelectedCampaign(campaign);
  };

  const confirmAssignment = () => {
    if (!selectedCampaign || !selectedCustomerId) {
      toast({
        title: 'Selection required',
        description: 'Please select both a campaign and a company',
        variant: 'destructive'
      });
      return;
    }

    assignMutation.mutate({
      campaignId: selectedCampaign.id,
      customerId: selectedCustomerId
    });
  };

  return {
    campaigns: filteredCampaigns,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedCampaign,
    setSelectedCampaign,
    assignModalOpen,
    setAssignModalOpen,
    selectedCustomerId,
    setSelectedCustomerId,
    companies,
    isLoadingCompanies,
    campaignDetails,
    isLoadingDetails,
    detailsError,
    handleAssignCampaign,
    handleViewDetails,
    confirmAssignment,
    assignMutation,
    refreshMetricsMutation
  };
}
