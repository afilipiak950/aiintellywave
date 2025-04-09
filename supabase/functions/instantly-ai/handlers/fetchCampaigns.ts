
import { corsHeaders } from "../corsHeaders.ts";

export async function handleFetchCampaigns(INSTANTLY_API_KEY: string, INSTANTLY_API_URL: string) {
  // Fetch all campaigns from Instantly
  const response = await fetch(`${INSTANTLY_API_URL}/campaigns/list`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Instantly API error:', data);
    return new Response(
      JSON.stringify({ error: data.message || 'Failed to fetch campaigns' }),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Transform the data to a more usable format
  const campaigns = data.data.map((campaign: any) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    created_at: campaign.created_at,
    updated_at: campaign.updated_at,
    metrics: {
      emailsSent: campaign.stats?.sent || 0,
      openRate: campaign.stats?.open_rate || 0,
      clickRate: campaign.stats?.click_rate || 0,
      conversionRate: campaign.stats?.conversion_rate || 0,
      replies: campaign.stats?.replies || 0,
    }
  }));

  return new Response(
    JSON.stringify({ campaigns }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
