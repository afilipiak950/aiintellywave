
-- Create function to get campaign company assignments for a specific company
CREATE OR REPLACE FUNCTION public.get_campaign_company_assignments(
  campaign_id_param TEXT DEFAULT NULL,
  company_id_param UUID DEFAULT NULL
)
RETURNS TABLE (campaign_id TEXT, company_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF campaign_id_param IS NOT NULL AND company_id_param IS NULL THEN
    -- Return all company assignments for a specific campaign
    RETURN QUERY
    SELECT 
      a.campaign_id,
      a.company_id
    FROM 
      public.campaign_company_assignments a
    WHERE 
      a.campaign_id = campaign_id_param;
  ELSIF campaign_id_param IS NULL AND company_id_param IS NOT NULL THEN
    -- Return all campaign assignments for a specific company
    RETURN QUERY
    SELECT 
      a.campaign_id,
      a.company_id
    FROM 
      public.campaign_company_assignments a
    WHERE 
      a.company_id = company_id_param;
  ELSE
    -- Return all assignments if both params are NULL
    -- Or return specific assignment if both params are provided
    RETURN QUERY
    SELECT 
      a.campaign_id,
      a.company_id
    FROM 
      public.campaign_company_assignments a
    WHERE 
      (campaign_id_param IS NULL OR a.campaign_id = campaign_id_param)
      AND
      (company_id_param IS NULL OR a.company_id = company_id_param);
  END IF;
END;
$$;
