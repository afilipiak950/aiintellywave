
-- Create a function to update campaign tags safely without requiring an edge function
CREATE OR REPLACE FUNCTION public.update_campaign_tags(
  p_campaign_id TEXT,
  p_tags TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, instantly_integration
AS $$
DECLARE
  campaign_exists BOOLEAN;
BEGIN
  -- Check if campaign exists
  SELECT EXISTS (
    SELECT 1 
    FROM instantly_integration.campaigns 
    WHERE campaign_id = p_campaign_id
  ) INTO campaign_exists;
  
  -- If campaign doesn't exist, create it
  IF NOT campaign_exists THEN
    INSERT INTO instantly_integration.campaigns (
      campaign_id,
      name,
      status,
      tags,
      created_at,
      updated_at,
      raw_data
    ) VALUES (
      p_campaign_id,
      'Campaign ' || substring(p_campaign_id, 1, 8),
      'unknown',
      p_tags,
      now(),
      now(),
      '{}'::jsonb
    );
  ELSE
    -- Update existing campaign
    UPDATE instantly_integration.campaigns
    SET 
      tags = p_tags,
      updated_at = now()
    WHERE campaign_id = p_campaign_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_campaign_tags(TEXT, TEXT[]) TO authenticated;
