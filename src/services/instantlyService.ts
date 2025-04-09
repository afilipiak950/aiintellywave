
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface InstantlyCampaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  metrics: {
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    replies: number;
  };
}

export interface InstantlyCampaignDetailedMetrics extends InstantlyCampaign {
  metrics: {
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    replies: number;
    dailyStats: Array<{
      date: string;
      sent: number;
      opened: number;
      clicked: number;
      replied: number;
    }>;
  };
}

export interface InstantlyCustomerCampaign {
  id: string;
  campaign_id: string;
  customer_id: string;
  assigned_at: string;
  campaign_name: string;
  campaign_status: string;
  metrics?: {
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    replies: number;
  };
}

/**
 * Fetches all available campaigns from Instantly.ai
 */
export const fetchInstantlyCampaigns = async (): Promise<InstantlyCampaign[]> => {
  try {
    // Add a timeout for the operation using a Promise.race
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. The Edge Function might be taking too long to respond.')), 10000);
    });

    // Use the new edge function 'instantly1-ai'
    const fetchPromise = supabase.functions.invoke('instantly1-ai', {
      body: { action: 'fetchCampaigns' }
    });

    // Use Promise.race to implement timeout without using AbortController
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const { data, error } = result as any;

    if (error) {
      console.error('Error in fetchInstantlyCampaigns:', error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    return data?.campaigns || [];
  } catch (error: any) {
    console.error('Exception in fetchInstantlyCampaigns:', error);
    if (error.message.includes('timed out')) {
      throw new Error('Request timed out. The Edge Function might be taking too long to respond.');
    }
    throw error;
  }
};

/**
 * Fetches detailed metrics for a specific campaign
 */
export const fetchCampaignDetails = async (campaignId: string): Promise<InstantlyCampaignDetailedMetrics> => {
  try {
    // Add a timeout for the operation using a Promise.race
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. The Edge Function might be taking too long to respond.')), 10000);
    });

    // Use the new edge function 'instantly1-ai'
    const fetchPromise = supabase.functions.invoke('instantly1-ai', {
      body: { action: 'fetchCampaignDetails', campaignId }
    });

    // Use Promise.race to implement timeout without using AbortController
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const { data, error } = result as any;

    if (error) {
      console.error('Error in fetchCampaignDetails:', error);
      throw new Error(`Failed to fetch campaign details: ${error.message}`);
    }

    return data.campaign;
  } catch (error: any) {
    console.error('Exception in fetchCampaignDetails:', error);
    if (error.message.includes('timed out')) {
      throw new Error('Request timed out. The Edge Function might be taking too long to respond.');
    }
    throw error;
  }
};

/**
 * Assigns a campaign to a customer
 */
export const assignCampaignToCustomer = async (campaignId: string, customerId: string): Promise<InstantlyCustomerCampaign> => {
  try {
    // Fetch campaign details first to get name and status
    const campaign = await fetchCampaignDetails(campaignId);
    
    // Create the assignment in the database
    const { data, error } = await supabase
      .from('instantly_customer_campaigns')
      .insert([
        { 
          campaign_id: campaignId, 
          customer_id: customerId,
          campaign_name: campaign.name,
          campaign_status: campaign.status,
          metrics: campaign.metrics,
          assigned_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error in assignCampaignToCustomer:', error);
      throw new Error(`Failed to assign campaign: ${error.message}`);
    }

    // Safe type conversion with proper handling of metrics
    return {
      id: data.id,
      campaign_id: data.campaign_id,
      customer_id: data.customer_id,
      assigned_at: data.assigned_at,
      campaign_name: data.campaign_name,
      campaign_status: data.campaign_status,
      metrics: getMetricsFromJson(data.metrics)
    };
  } catch (error: any) {
    console.error('Exception in assignCampaignToCustomer:', error);
    throw error;
  }
};

/**
 * Fetches all campaigns assigned to a specific customer
 */
export const fetchCustomerCampaigns = async (customerId: string): Promise<InstantlyCustomerCampaign[]> => {
  try {
    const { data, error } = await supabase
      .from('instantly_customer_campaigns')
      .select('*')
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error in fetchCustomerCampaigns:', error);
      throw new Error(`Failed to fetch customer campaigns: ${error.message}`);
    }

    // Safe type conversion with proper handling of metrics
    return data.map(item => ({
      id: item.id,
      campaign_id: item.campaign_id,
      customer_id: item.customer_id,
      assigned_at: item.assigned_at,
      campaign_name: item.campaign_name,
      campaign_status: item.campaign_status,
      metrics: getMetricsFromJson(item.metrics)
    }));
  } catch (error: any) {
    console.error('Exception in fetchCustomerCampaigns:', error);
    throw error;
  }
};

/**
 * Refreshes campaign metrics for all assigned campaigns
 */
export const refreshCampaignMetrics = async (): Promise<void> => {
  try {
    // Add a timeout for the operation using a Promise.race
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. The Edge Function might be taking too long to respond.')), 15000);
    });

    // Use the new edge function 'instantly1-ai'
    const fetchPromise = supabase.functions.invoke('instantly1-ai', {
      body: { action: 'refreshMetrics' }
    });

    // Use Promise.race to implement timeout without using AbortController
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const { data, error } = result as any;

    if (error) {
      console.error('Error in refreshCampaignMetrics:', error);
      throw new Error(`Failed to refresh metrics: ${error.message}`);
    }

    if (data.success) {
      toast({
        title: "Success",
        description: `Refreshed metrics for ${data.updatedCount} campaigns`,
      });
    } else {
      toast({
        title: "Warning",
        description: data.message || "Some campaigns failed to refresh",
        variant: "destructive"
      });
    }
  } catch (error: any) {
    console.error('Exception in refreshCampaignMetrics:', error);
    if (error.message.includes('timed out')) {
      throw new Error('Request timed out. The Edge Function might be taking too long to respond.');
    }
    throw error;
  }
};

/**
 * Helper function to safely extract metrics from JSON data
 */
const getMetricsFromJson = (metricsJson: any): InstantlyCustomerCampaign['metrics'] | undefined => {
  if (!metricsJson) return undefined;
  
  // Make sure we have an object
  if (typeof metricsJson !== 'object') return undefined;
  
  // Extract metrics with type safety
  return {
    emailsSent: getNumberValue(metricsJson, 'emailsSent'),
    openRate: getNumberValue(metricsJson, 'openRate'),
    clickRate: getNumberValue(metricsJson, 'clickRate'),
    conversionRate: getNumberValue(metricsJson, 'conversionRate'),
    replies: getNumberValue(metricsJson, 'replies')
  };
};

/**
 * Helper function to safely extract a number value from a JSON object
 */
const getNumberValue = (obj: any, key: string): number => {
  if (!obj || typeof obj !== 'object') return 0;
  const value = obj[key];
  return typeof value === 'number' ? value : 0;
};
