
-- Create a function to safely get campaign tags
CREATE OR REPLACE FUNCTION public.get_campaign_tags()
RETURNS TABLE (
  campaign_id TEXT,
  tags TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, instantly_integration, pg_temp
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    c.campaign_id,
    c.tags
  FROM 
    instantly_integration.campaigns c;
END;
$$;
