
-- Create table for campaign user assignments
CREATE TABLE IF NOT EXISTS public.campaign_user_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

-- Create function to get campaign user assignments
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
  IF campaign_id_param IS NOT NULL AND user_id_param IS NULL THEN
    -- Return all user assignments for a specific campaign
    RETURN QUERY
    SELECT 
      a.campaign_id,
      a.user_id
    FROM 
      public.campaign_user_assignments a
    WHERE 
      a.campaign_id = campaign_id_param;
  ELSIF campaign_id_param IS NULL AND user_id_param IS NOT NULL THEN
    -- Return all campaign assignments for a specific user
    RETURN QUERY
    SELECT 
      a.campaign_id,
      a.user_id
    FROM 
      public.campaign_user_assignments a
    WHERE 
      a.user_id = user_id_param;
  ELSE
    -- Return specific assignment if both params are provided,
    -- or all assignments if both params are NULL
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
  END IF;
END;
$$;
