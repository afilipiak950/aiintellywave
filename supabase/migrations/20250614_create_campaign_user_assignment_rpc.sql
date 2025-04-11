
-- Function to get campaign user assignments
CREATE OR REPLACE FUNCTION public.get_campaign_user_assignments(
  campaign_id_param TEXT DEFAULT NULL,
  user_id_param UUID DEFAULT NULL
)
RETURNS TABLE (campaign_id TEXT, user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.campaign_id,
    a.user_id
  FROM 
    public.campaign_user_assignments a
  WHERE 
    (campaign_id_param IS NULL OR a.campaign_id = campaign_id_param)
    AND
    (user_id_param IS NULL OR a.user_id = user_id_param);
END;
$$;
