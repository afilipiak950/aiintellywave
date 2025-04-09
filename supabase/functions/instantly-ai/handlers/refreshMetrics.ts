
import { corsHeaders } from "../corsHeaders.ts";
import { supabaseClient } from "../supabase.ts";

export async function handleRefreshMetrics(
  INSTANTLY_API_KEY: string,
  INSTANTLY_API_URL: string
) {
  try {
    // Fetch all customer campaigns from Supabase
    const { data: customerCampaigns, error: fetchError } = await supabaseClient
      .from('instantly_customer_campaigns')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching customer campaigns:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch customer campaigns', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failureCount = 0;
    const updatePromises = customerCampaigns.map(async (campaign) => {
      try {
        // Fetch latest campaign metrics from Instantly
        const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaign.campaign_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error(`Failed to fetch metrics for campaign ${campaign.campaign_id}:`, data);
          failureCount++;
          return;
        }

        // Update campaign metrics in Supabase
        const { error: updateError } = await supabaseClient
          .from('instantly_customer_campaigns')
          .update({
            metrics: {
              emailsSent: data.data.stats?.sent || 0,
              openRate: data.data.stats?.open_rate || 0,
              clickRate: data.data.stats?.click_rate || 0,
              conversionRate: data.data.stats?.conversion_rate || 0,
              replies: data.data.stats?.replies || 0,
            },
            campaign_status: data.data.status
          })
          .eq('id', campaign.id);

        if (updateError) {
          console.error(`Failed to update campaign ${campaign.campaign_id}:`, updateError);
          failureCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing campaign ${campaign.campaign_id}:`, error);
        failureCount++;
      }
    });

    await Promise.allSettled(updatePromises);

    return new Response(
      JSON.stringify({ 
        message: 'Campaign metrics refreshed', 
        successCount, 
        failureCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error refreshing campaign metrics:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to refresh campaign metrics' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
