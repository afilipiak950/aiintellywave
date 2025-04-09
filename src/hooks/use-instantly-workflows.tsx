
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  fetchInstantlyCampaigns, 
  fetchCampaignDetails, 
  assignCampaignToCustomer,
  refreshCampaignMetrics,
  InstantlyCampaign,
  InstantlyCampaignDetailedMetrics,
  InstantlyApiError
} from '@/services/instantlyService';
import { supabase } from '@/integrations/supabase/client';

export function useInstantlyWorkflows() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<InstantlyCampaign | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // Fetch all campaigns with enhanced error handling
  const { 
    data: campaigns, 
    isLoading, 
    error, 
    refetch,
    isError
  } = useQuery({
    queryKey: ['instantly-campaigns'],
    queryFn: fetchInstantlyCampaigns,
    retry: 2,
    retryDelay: 1000
  });

  // Display toast on error
  useEffect(() => {
    if (error) {
      console.error('Campaign fetch query error:', error);
      
      // Format a user-friendly error message
      let errorMessage = 'Failed to load campaigns';
      if (error instanceof InstantlyApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more helpful context for common errors
        if (error.message.includes('Edge Function')) {
          errorMessage = 'Failed to send a request to the Edge Function';
        } else if (error.message.includes('non-2xx status code')) {
          errorMessage = 'Edge Function returned an error. Check the function logs for details.';
        } else if (error.message.includes('parse') || error.message.includes('JSON')) {
          errorMessage = 'Request parsing error. Check the Edge Function logs for details.';
        }
      }
      
      toast({
        title: 'Error loading campaigns',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [error]);

  // Fetch companies for assignment with improved error handling
  const { 
    data: companies,
    isLoading: isLoadingCompanies,
    error: companiesError
  } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        console.log('Fetching companies for campaign assignment');
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error('Database error fetching companies:', error);
          throw new Error(`Failed to load companies: ${error.message}`);
        }
        
        console.log(`Fetched ${data.length} companies`);
        return data;
      } catch (error: any) {
        console.error('Error in companies query:', error);
        throw error;
      }
    },
    retry: 1
  });

  // Fetch campaign details with detailed error handling
  const { 
    data: campaignDetails,
    isLoading: isLoadingDetails,
    error: detailsError
  } = useQuery({
    queryKey: ['campaign-details', selectedCampaign?.id],
    queryFn: async () => {
      if (!selectedCampaign) return null;
      
      try {
        return await fetchCampaignDetails(selectedCampaign.id);
      } catch (error: any) {
        console.error('Error fetching campaign details:', error);
        
        // Format a user-friendly error message
        let errorMessage = 'Failed to load campaign details';
        if (error instanceof InstantlyApiError) {
          errorMessage = error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast({
          title: 'Error loading campaign details',
          description: errorMessage,
          variant: 'destructive'
        });
        
        throw error;
      }
    },
    enabled: !!selectedCampaign,
    retry: 1
  });

  // Assign campaign mutation with improved error handling
  const assignMutation = useMutation({
    mutationFn: async ({ campaignId, customerId }: { campaignId: string, customerId: string }) => {
      try {
        if (!campaignId) throw new Error('Campaign ID is required');
        if (!customerId) throw new Error('Customer ID is required');
        
        console.log(`Assigning campaign ${campaignId} to customer ${customerId}`);
        return await assignCampaignToCustomer(campaignId, customerId);
      } catch (error: any) {
        console.error('Error in assignCampaignToCustomer:', error);
        
        // Format a user-friendly error message
        let errorMessage = 'Failed to assign campaign';
        if (error instanceof InstantlyApiError) {
          errorMessage = error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      console.log('Campaign assigned successfully:', data);
      toast({
        title: 'Campaign assigned successfully',
        description: `Campaign "${data.campaign_name}" is now available to the customer`
      });
      setAssignModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['customer-campaigns'] });
    },
    onError: (error: any) => {
      console.error('Campaign assignment error:', error);
      toast({
        title: 'Failed to assign campaign',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Refresh metrics mutation with improved error handling
  const refreshMetricsMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log('Initiating metrics refresh');
        return await refreshCampaignMetrics();
      } catch (error: any) {
        console.error('Error in refreshCampaignMetrics:', error);
        
        // Format a user-friendly error message
        let errorMessage = 'Failed to refresh metrics';
        if (error instanceof InstantlyApiError) {
          errorMessage = error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      console.log('Metrics refreshed successfully');
      
      // Invalidate all related queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['instantly-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-details'] });
      queryClient.invalidateQueries({ queryKey: ['customer-campaigns'] });
    },
    onError: (error: any) => {
      console.error('Metrics refresh error:', error);
      toast({
        title: 'Failed to refresh metrics',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns?.filter(campaign => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      campaign.name.toLowerCase().includes(term) ||
      campaign.status.toLowerCase().includes(term) ||
      campaign.id.toLowerCase().includes(term)
    );
  });

  // Handle opening the assign modal
  const handleAssignCampaign = useCallback((campaign: InstantlyCampaign) => {
    setSelectedCampaign(campaign);
    setAssignModalOpen(true);
    
    // Reset the selected customer
    setSelectedCustomerId('');
  }, []);

  // Handle opening the details view
  const handleViewDetails = useCallback((campaign: InstantlyCampaign) => {
    setSelectedCampaign(campaign);
    setAssignModalOpen(false);
  }, []);

  // Handle the assignment confirmation
  const confirmAssignment = useCallback(() => {
    if (!selectedCampaign) {
      toast({
        title: 'No campaign selected',
        description: 'Please select a campaign to assign',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedCustomerId) {
      toast({
        title: 'No customer selected',
        description: 'Please select a customer to assign the campaign to',
        variant: 'destructive'
      });
      return;
    }

    assignMutation.mutate({
      campaignId: selectedCampaign.id,
      customerId: selectedCustomerId
    });
  }, [selectedCampaign, selectedCustomerId, assignMutation]);

  // Check if API key is configured by examining the error
  const isApiKeyMissing = error instanceof Error && 
    (error.message.includes('API key') || 
     error.message.includes('configuration') ||
     (error instanceof InstantlyApiError && error.status === 500));

  // Retry with exponential backoff when applicable
  useEffect(() => {
    if (isError && !isApiKeyMissing) {
      const timer = setTimeout(() => {
        console.log('Automatically retrying campaign fetch...');
        refetch();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isError, isApiKeyMissing, refetch]);

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
    companiesError,
    campaignDetails,
    isLoadingDetails,
    detailsError,
    handleAssignCampaign,
    handleViewDetails,
    confirmAssignment,
    assignMutation,
    refreshMetricsMutation,
    isApiKeyMissing
  };
}
