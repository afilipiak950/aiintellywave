
import { corsHeaders } from "../corsHeaders.ts";
import { supabaseClient } from "../supabase.ts";

export async function handleAssignCampaign(
  INSTANTLY_API_KEY: string,
  INSTANTLY_API_URL: string,
  campaignId: string,
  customerId: string
) {
  if (!campaignId || !customerId) {
    return new Response(
      JSON.stringify({ error: 'Campaign ID and Customer ID are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // First, fetch campaign details to get name and status
    const detailsResponse = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const detailsData = await detailsResponse.json();
    
    if (!detailsResponse.ok) {
      return new Response(
        JSON.stringify({ error: detailsData.message || 'Failed to fetch campaign details' }),
        { status: detailsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert campaign assignment into Supabase
    const { data, error } = await supabaseClient
      .from('instantly_customer_campaigns')
      .insert({
        customer_id: customerId,
        campaign_id: campaignId,
        campaign_name: detailsData.data.name,
        campaign_status: detailsData.data.status,
        metrics: {
          emailsSent: detailsData.data.stats?.sent || 0,
          openRate: detailsData.data.stats?.open_rate || 0,
          clickRate: detailsData.data.stats?.click_rate || 0,
          conversionRate: detailsData.data.stats?.conversion_rate || 0,
          replies: detailsData.data.stats?.replies || 0,
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase assignment error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to assign campaign', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Campaign assigned successfully', 
        assignment: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error assigning campaign:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to assign campaign' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
