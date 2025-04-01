
import { supabase } from '@/integrations/supabase/client';
import { CustomerMetric, CustomerMetricFormData } from '@/types/customer-metrics';
import { toast } from '@/hooks/use-toast';

// Create or update customer metrics
export const upsertCustomerMetrics = async (
  customerId: string, 
  data: CustomerMetricFormData
): Promise<CustomerMetric | null> => {
  try {
    // First, check if metrics exist for this customer
    const { data: existingMetrics } = await supabase
      .from('customer_metrics')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle();
    
    if (existingMetrics) {
      // Update existing metrics with previous values
      const { data: updatedMetrics, error } = await supabase
        .from('customer_metrics')
        .update({
          previous_conversion_rate: existingMetrics.conversion_rate,
          previous_booking_candidates: existingMetrics.booking_candidates,
          conversion_rate: data.conversion_rate,
          booking_candidates: data.booking_candidates,
          updated_at: new Date().toISOString()
        })
        .eq('customer_id', customerId)
        .select()
        .single();
      
      if (error) throw error;
      return updatedMetrics as CustomerMetric;
    } else {
      // Create new metrics
      const { data: newMetrics, error } = await supabase
        .from('customer_metrics')
        .insert({
          customer_id: customerId,
          conversion_rate: data.conversion_rate,
          booking_candidates: data.booking_candidates,
          previous_conversion_rate: 0,
          previous_booking_candidates: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return newMetrics as CustomerMetric;
    }
  } catch (error) {
    console.error('Error upserting customer metrics:', error);
    toast({
      title: "Error",
      description: "Failed to save customer metrics",
      variant: "destructive"
    });
    return null;
  }
};

// Get metrics for a specific customer
export const getCustomerMetrics = async (customerId: string): Promise<CustomerMetric | null> => {
  try {
    const { data, error } = await supabase
      .from('customer_metrics')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle();
    
    if (error) throw error;
    
    // If no metrics exist yet, return default values
    if (!data) {
      return {
        id: '',
        customer_id: customerId,
        conversion_rate: 0,
        booking_candidates: 0,
        previous_conversion_rate: 0,
        previous_booking_candidates: 0,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    }
    
    return data as CustomerMetric;
  } catch (error) {
    console.error('Error fetching customer metrics:', error);
    return null;
  }
};

// Get aggregated metrics for the dashboard
export const getAggregatedMetrics = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_aggregated_metrics');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching aggregated metrics:', error);
    return {
      avg_conversion_rate: 0,
      total_booking_candidates: 0,
      customer_count: 0
    };
  }
};
