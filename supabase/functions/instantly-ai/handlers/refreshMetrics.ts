
import { corsHeaders } from "../corsHeaders.ts";

export async function handleRefreshMetrics(INSTANTLY_API_KEY: string, INSTANTLY_API_URL: string) {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Use native fetch for database operations
    const { data: customerCampaigns, error: fetchError } = await fetch(
      `${supabaseUrl}/rest/v1/instantly_customer_campaigns?select=*`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
      }
    ).then(res => res.json());
    
    if (fetchError) {
      console.error('Error fetching customer campaigns:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch customer campaigns', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failureCount = 0;
    
    for (const campaign of customerCampaigns) {
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
          continue;
        }

        // Update campaign metrics in Supabase
        const updateResult = await fetch(
          `${supabaseUrl}/rest/v1/instantly_customer_campaigns?id=eq.${campaign.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              metrics: {
                emailsSent: data.data.stats?.sent || 0,
                openRate: data.data.stats?.open_rate || 0,
                clickRate: data.data.stats?.click_rate || 0,
                conversionRate: data.data.stats?.conversion_rate || 0,
                replies: data.data.stats?.replies || 0,
              },
              campaign_status: data.data.status,
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (!updateResult.ok) {
          console.error(`Failed to update campaign ${campaign.campaign_id}:`, await updateResult.text());
          failureCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing campaign ${campaign.campaign_id}:`, error);
        failureCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Campaign metrics refreshed', 
        updatedCount: successCount, 
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
